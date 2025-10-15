package com.superapp.core.risk.repository;

import com.superapp.core.risk.domain.entity.RiskScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RiskScoreRepository extends JpaRepository<RiskScore, UUID> {
    
    Optional<RiskScore> findByIdAndTenantId(UUID id, String tenantId);
    
    Optional<RiskScore> findByTenantIdAndUserId(String tenantId, UUID userId);
}




