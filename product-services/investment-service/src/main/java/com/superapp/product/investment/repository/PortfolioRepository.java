package com.superapp.product.investment.repository;

import com.superapp.product.investment.domain.entity.Portfolio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PortfolioRepository extends JpaRepository<Portfolio, UUID> {
    
    Optional<Portfolio> findByIdAndTenantId(UUID id, String tenantId);
    
    List<Portfolio> findByTenantIdAndUserId(String tenantId, UUID userId);
    
    Optional<Portfolio> findByTenantIdAndUserIdAndIsDefaultTrue(String tenantId, UUID userId);
}




