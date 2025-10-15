package com.superapp.core.risk.dto.response;

import com.superapp.core.risk.domain.enums.AlertStatus;
import com.superapp.core.risk.domain.enums.RiskLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RiskAlertResponse {

    private UUID id;
    private String tenantId;
    private UUID userId;
    private RiskLevel riskLevel;
    private AlertStatus status;
    private String alertType;
    private String description;
    private String entityType;
    private UUID entityId;
    private String assignedTo;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}




