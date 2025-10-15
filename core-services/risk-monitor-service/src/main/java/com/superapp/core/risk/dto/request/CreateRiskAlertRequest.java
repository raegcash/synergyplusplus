package com.superapp.core.risk.dto.request;

import com.superapp.core.risk.domain.enums.RiskLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateRiskAlertRequest {

    @NotNull(message = "User ID is required")
    private UUID userId;

    @NotNull(message = "Risk level is required")
    private RiskLevel riskLevel;

    @NotBlank(message = "Alert type is required")
    private String alertType;

    private String description;
    
    private String entityType;
    
    private UUID entityId;
    
    private String metadata;
}




