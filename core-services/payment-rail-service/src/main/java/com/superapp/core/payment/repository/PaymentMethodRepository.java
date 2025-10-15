package com.superapp.core.payment.repository;

import com.superapp.core.payment.domain.entity.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Payment method repository
 */
@Repository
public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, UUID> {
    
    Optional<PaymentMethod> findByIdAndTenantId(UUID id, String tenantId);
    
    List<PaymentMethod> findByTenantIdAndUserId(String tenantId, UUID userId);
    
    Optional<PaymentMethod> findByTenantIdAndUserIdAndIsDefaultTrue(String tenantId, UUID userId);
}




