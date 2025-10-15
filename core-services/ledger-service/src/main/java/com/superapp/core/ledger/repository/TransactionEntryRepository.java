package com.superapp.core.ledger.repository;

import com.superapp.core.ledger.domain.entity.Account;
import com.superapp.core.ledger.domain.entity.Transaction;
import com.superapp.core.ledger.domain.entity.TransactionEntry;
import com.superapp.core.ledger.domain.enums.EntryType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Transaction Entry Repository
 */
@Repository
public interface TransactionEntryRepository extends JpaRepository<TransactionEntry, UUID> {

    List<TransactionEntry> findByTransaction(Transaction transaction);

    List<TransactionEntry> findByAccount(Account account);

    List<TransactionEntry> findByAccountAndEntryType(Account account, EntryType entryType);

    @Query("SELECT e FROM TransactionEntry e WHERE e.account = :account AND e.transaction.transactionDate BETWEEN :startDate AND :endDate")
    List<TransactionEntry> findByAccountAndDateRange(Account account, LocalDateTime startDate, LocalDateTime endDate);

    @Query("SELECT e FROM TransactionEntry e WHERE e.account.id = :accountId ORDER BY e.createdAt DESC")
    List<TransactionEntry> findByAccountOrderByDate(UUID accountId);
}




