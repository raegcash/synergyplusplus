package com.superapp.core.payment.repository;

import com.superapp.core.payment.domain.entity.PaymentTransaction;
import com.superapp.core.payment.domain.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Payment transaction repository
 */
@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, UUID> {
    
    Optional<PaymentTransaction> findByIdAndTenantId(UUID id, String tenantId);
    
    Page<PaymentTransaction> findByTenantIdAndUserId(String tenantId, UUID userId, Pageable pageable);
    
    List<PaymentTransaction> findByTenantIdAndStatus(String tenantId, PaymentStatus status);
    
    Optional<PaymentTransaction> findByExternalReference(String externalReference);
}




