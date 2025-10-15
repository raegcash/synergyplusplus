package com.superapp.core.risk.repository;

import com.superapp.core.risk.domain.entity.RiskAlert;
import com.superapp.core.risk.domain.enums.AlertStatus;
import com.superapp.core.risk.domain.enums.RiskLevel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RiskAlertRepository extends JpaRepository<RiskAlert, UUID> {
    
    Optional<RiskAlert> findByIdAndTenantId(UUID id, String tenantId);
    
    Page<RiskAlert> findByTenantIdAndUserId(String tenantId, UUID userId, Pageable pageable);
    
    List<RiskAlert> findByTenantIdAndStatusAndRiskLevel(String tenantId, AlertStatus status, RiskLevel riskLevel);
    
    Page<RiskAlert> findByTenantIdAndStatus(String tenantId, AlertStatus status, Pageable pageable);
}




