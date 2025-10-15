package com.superapp.core.ledger.repository;

import com.superapp.core.ledger.domain.entity.Transaction;
import com.superapp.core.ledger.domain.enums.TransactionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Transaction Repository
 */
@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    Optional<Transaction> findByTransactionNumber(String transactionNumber);

    List<Transaction> findByTenantId(String tenantId);

    List<Transaction> findByTenantIdAndStatus(String tenantId, TransactionStatus status);

    List<Transaction> findByReferenceId(String referenceId);

    Optional<Transaction> findByReferenceIdAndReferenceType(String referenceId, String referenceType);

    @Query("SELECT t FROM Transaction t WHERE t.tenantId = :tenantId AND t.transactionDate BETWEEN :startDate AND :endDate")
    List<Transaction> findByTenantIdAndDateRange(String tenantId, LocalDateTime startDate, LocalDateTime endDate);

    @Query("SELECT t FROM Transaction t WHERE t.tenantId = :tenantId AND t.status = :status ORDER BY t.transactionDate DESC")
    List<Transaction> findRecentByTenantIdAndStatus(String tenantId, TransactionStatus status);

    boolean existsByTransactionNumber(String transactionNumber);

    long countByTenantIdAndStatus(String tenantId, TransactionStatus status);
}




