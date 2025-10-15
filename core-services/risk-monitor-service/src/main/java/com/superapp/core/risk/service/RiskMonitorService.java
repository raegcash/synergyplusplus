package com.superapp.core.risk.service;

import com.superapp.core.risk.domain.entity.RiskAlert;
import com.superapp.core.risk.domain.entity.RiskScore;
import com.superapp.core.risk.domain.enums.AlertStatus;
import com.superapp.core.risk.domain.enums.RiskLevel;
import com.superapp.core.risk.domain.exception.ResourceNotFoundException;
import com.superapp.core.risk.dto.mapper.RiskAlertMapper;
import com.superapp.core.risk.dto.mapper.RiskScoreMapper;
import com.superapp.core.risk.dto.request.CreateRiskAlertRequest;
import com.superapp.core.risk.dto.response.RiskAlertResponse;
import com.superapp.core.risk.dto.response.RiskScoreResponse;
import com.superapp.core.risk.repository.RiskAlertRepository;
import com.superapp.core.risk.repository.RiskScoreRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class RiskMonitorService {

    private final RiskAlertRepository alertRepository;
    private final RiskScoreRepository scoreRepository;
    private final RiskAlertMapper alertMapper;
    private final RiskScoreMapper scoreMapper;

    @Transactional
    public RiskAlertResponse createAlert(String tenantId, CreateRiskAlertRequest request) {
        log.info("Creating risk alert for tenant: {}, user: {}", tenantId, request.getUserId());

        RiskAlert alert = RiskAlert.builder()
                .tenantId(tenantId)
                .userId(request.getUserId())
                .riskLevel(request.getRiskLevel())
                .status(AlertStatus.OPEN)
                .alertType(request.getAlertType())
                .description(request.getDescription())
                .entityType(request.getEntityType())
                .entityId(request.getEntityId())
                .metadata(request.getMetadata())
                .build();

        RiskAlert saved = alertRepository.save(alert);
        log.info("Risk alert created: {}", saved.getId());

        return alertMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public RiskAlertResponse getAlert(UUID alertId, String tenantId) {
        RiskAlert alert = alertRepository.findByIdAndTenantId(alertId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("RiskAlert", "id", alertId));
        return alertMapper.toResponse(alert);
    }

    @Transactional(readOnly = true)
    public Page<RiskAlertResponse> getUserAlerts(String tenantId, UUID userId, Pageable pageable) {
        return alertRepository.findByTenantIdAndUserId(tenantId, userId, pageable)
                .map(alertMapper::toResponse);
    }

    @Transactional
    public RiskAlertResponse updateAlertStatus(UUID alertId, String tenantId, AlertStatus status) {
        RiskAlert alert = alertRepository.findByIdAndTenantId(alertId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("RiskAlert", "id", alertId));

        alert.setStatus(status);
        RiskAlert updated = alertRepository.save(alert);
        
        log.info("Risk alert status updated: {} -> {}", alertId, status);
        return alertMapper.toResponse(updated);
    }

    @Transactional
    public RiskScoreResponse calculateRiskScore(String tenantId, UUID userId) {
        log.info("Calculating risk score for tenant: {}, user: {}", tenantId, userId);

        // Simple risk score calculation (in production, this would be more complex)
        BigDecimal score = BigDecimal.valueOf(Math.random() * 100);
        RiskLevel riskLevel = determineRiskLevel(score);

        RiskScore riskScore = RiskScore.builder()
                .tenantId(tenantId)
                .userId(userId)
                .score(score)
                .riskLevel(riskLevel)
                .factors("Transaction history, behavior patterns, velocity checks")
                .build();

        // Update existing or create new
        scoreRepository.findByTenantIdAndUserId(tenantId, userId)
                .ifPresent(existing -> riskScore.setId(existing.getId()));

        RiskScore saved = scoreRepository.save(riskScore);
        log.info("Risk score calculated: {} for user: {}", saved.getScore(), userId);

        return scoreMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public RiskScoreResponse getUserRiskScore(String tenantId, UUID userId) {
        RiskScore score = scoreRepository.findByTenantIdAndUserId(tenantId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("RiskScore", "userId", userId));
        return scoreMapper.toResponse(score);
    }

    private RiskLevel determineRiskLevel(BigDecimal score) {
        if (score.compareTo(BigDecimal.valueOf(80)) >= 0) {
            return RiskLevel.CRITICAL;
        } else if (score.compareTo(BigDecimal.valueOf(60)) >= 0) {
            return RiskLevel.HIGH;
        } else if (score.compareTo(BigDecimal.valueOf(30)) >= 0) {
            return RiskLevel.MEDIUM;
        } else {
            return RiskLevel.LOW;
        }
    }
}




