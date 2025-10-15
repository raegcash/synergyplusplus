package com.superapp.core.ledger.service;

import com.superapp.core.ledger.domain.entity.Account;
import com.superapp.core.ledger.domain.exception.ResourceNotFoundException;
import com.superapp.core.ledger.dto.mapper.AccountMapper;
import com.superapp.core.ledger.dto.request.CreateAccountRequest;
import com.superapp.core.ledger.dto.response.AccountResponse;
import com.superapp.core.ledger.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Account Service
 * Handles ledger account management
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final AccountMapper accountMapper;

    /**
     * Create a new account
     */
    @Transactional
    public AccountResponse createAccount(CreateAccountRequest request) {
        log.info("Creating account: {}", request.getAccountCode());

        Account account = accountMapper.toEntity(request);
        account.setBalance(BigDecimal.ZERO);
        account.setIsActive(true);

        Account savedAccount = accountRepository.save(account);
        log.info("Account created: {}", savedAccount.getAccountCode());

        return accountMapper.toResponse(savedAccount);
    }

    /**
     * Get account by ID
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "accounts", key = "#accountId")
    public AccountResponse getAccountById(UUID accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "id", accountId));
        return accountMapper.toResponse(account);
    }

    /**
     * Get account by code
     */
    @Transactional(readOnly = true)
    public AccountResponse getAccountByCode(String accountCode) {
        Account account = accountRepository.findByAccountCode(accountCode)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "accountCode", accountCode));
        return accountMapper.toResponse(account);
    }

    /**
     * Get all accounts for a tenant
     */
    @Transactional(readOnly = true)
    public List<AccountResponse> getAccountsByTenant(String tenantId) {
        return accountRepository.findByTenantId(tenantId).stream()
                .map(accountMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get accounts for a user
     */
    @Transactional(readOnly = true)
    public List<AccountResponse> getAccountsByUser(UUID userId) {
        return accountRepository.findByUserId(userId).stream()
                .map(accountMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Deactivate account
     */
    @Transactional
    @CacheEvict(value = "accounts", key = "#accountId")
    public void deactivateAccount(UUID accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "id", accountId));

        account.setIsActive(false);
        accountRepository.save(account);

        log.info("Account deactivated: {}", account.getAccountCode());
    }

    /**
     * Get account balance
     */
    @Transactional(readOnly = true)
    public BigDecimal getAccountBalance(String accountCode) {
        Account account = accountRepository.findByAccountCode(accountCode)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "accountCode", accountCode));
        return account.getBalance();
    }
}




