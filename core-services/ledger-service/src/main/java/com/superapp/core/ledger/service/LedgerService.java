package com.superapp.core.ledger.service;

import com.superapp.core.ledger.domain.entity.Account;
import com.superapp.core.ledger.domain.entity.Transaction;
import com.superapp.core.ledger.domain.entity.TransactionEntry;
import com.superapp.core.ledger.domain.enums.EntryType;
import com.superapp.core.ledger.domain.enums.TransactionStatus;
import com.superapp.core.ledger.domain.exception.InvalidTransactionException;
import com.superapp.core.ledger.domain.exception.ResourceNotFoundException;
import com.superapp.core.ledger.dto.mapper.TransactionMapper;
import com.superapp.core.ledger.dto.request.CreateTransactionRequest;
import com.superapp.core.ledger.dto.response.TransactionResponse;
import com.superapp.core.ledger.repository.AccountRepository;
import com.superapp.core.ledger.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Ledger Service
 * Implements double-entry bookkeeping system
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class LedgerService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final TransactionMapper transactionMapper;

    /**
     * Create a new transaction with double-entry validation
     */
    @Transactional
    public TransactionResponse createTransaction(CreateTransactionRequest request) {
        log.info("Creating transaction for tenant: {}", request.getTenantId());

        // Validate entries balance (debits = credits)
        BigDecimal totalDebits = BigDecimal.ZERO;
        BigDecimal totalCredits = BigDecimal.ZERO;

        for (CreateTransactionRequest.TransactionEntryRequest entryReq : request.getEntries()) {
            if (entryReq.getEntryType().equalsIgnoreCase("DEBIT")) {
                totalDebits = totalDebits.add(entryReq.getAmount());
            } else if (entryReq.getEntryType().equalsIgnoreCase("CREDIT")) {
                totalCredits = totalCredits.add(entryReq.getAmount());
            }
        }

        if (totalDebits.compareTo(totalCredits) != 0) {
            throw new InvalidTransactionException(
                    String.format("Transaction not balanced. Debits: %s, Credits: %s", 
                            totalDebits, totalCredits));
        }

        // Create transaction
        Transaction transaction = Transaction.builder()
                .transactionNumber(generateTransactionNumber())
                .tenantId(request.getTenantId())
                .transactionDate(request.getTransactionDate())
                .description(request.getDescription())
                .referenceId(request.getReferenceId())
                .referenceType(request.getReferenceType())
                .totalAmount(request.getTotalAmount())
                .currency(request.getCurrency())
                .status(TransactionStatus.PENDING)
                .entries(new ArrayList<>())
                .metadata(request.getMetadata())
                .build();

        // Create entries
        for (CreateTransactionRequest.TransactionEntryRequest entryReq : request.getEntries()) {
            Account account = accountRepository.findByAccountCode(entryReq.getAccountCode())
                    .orElseThrow(() -> new ResourceNotFoundException("Account", "accountCode", entryReq.getAccountCode()));

            EntryType entryType = EntryType.valueOf(entryReq.getEntryType().toUpperCase());

            TransactionEntry entry = TransactionEntry.builder()
                    .transaction(transaction)
                    .account(account)
                    .entryType(entryType)
                    .amount(entryReq.getAmount())
                    .description(entryReq.getDescription())
                    .build();

            transaction.addEntry(entry);
        }

        // Save transaction
        Transaction savedTransaction = transactionRepository.save(transaction);

        // Post transaction (update account balances)
        postTransaction(savedTransaction);

        log.info("Transaction created: {}", savedTransaction.getTransactionNumber());
        return transactionMapper.toResponse(savedTransaction);
    }

    /**
     * Post transaction to accounts (update balances)
     */
    @Transactional
    public void postTransaction(Transaction transaction) {
        if (transaction.getStatus() != TransactionStatus.PENDING) {
            throw new InvalidTransactionException("Only PENDING transactions can be posted");
        }

        for (TransactionEntry entry : transaction.getEntries()) {
            Account account = entry.getAccount();

            // Update account balance based on entry type
            if (entry.getEntryType() == EntryType.DEBIT) {
                account.debit(entry.getAmount());
            } else {
                account.credit(entry.getAmount());
            }

            // Record balance snapshot
            entry.setBalanceAfter(account.getBalance());

            accountRepository.save(account);
        }

        transaction.setStatus(TransactionStatus.POSTED);
        transactionRepository.save(transaction);

        log.info("Transaction posted: {}", transaction.getTransactionNumber());
    }

    /**
     * Get transaction by ID
     */
    @Transactional(readOnly = true)
    public TransactionResponse getTransaction(UUID transactionId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", "id", transactionId));
        return transactionMapper.toResponse(transaction);
    }

    /**
     * Get all transactions for a tenant
     */
    @Transactional(readOnly = true)
    public List<TransactionResponse> getTransactionsByTenant(String tenantId) {
        return transactionRepository.findByTenantId(tenantId).stream()
                .map(transactionMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get transactions by date range
     */
    @Transactional(readOnly = true)
    public List<TransactionResponse> getTransactionsByDateRange(
            String tenantId, LocalDateTime startDate, LocalDateTime endDate) {
        return transactionRepository.findByTenantIdAndDateRange(tenantId, startDate, endDate).stream()
                .map(transactionMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Generate unique transaction number
     */
    private String generateTransactionNumber() {
        String prefix = "TXN";
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String random = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return prefix + "-" + timestamp + "-" + random;
    }
}




