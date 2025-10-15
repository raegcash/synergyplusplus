package com.superapp.core.risk.dto.response;

import com.superapp.core.risk.domain.enums.RiskLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RiskScoreResponse {

    private UUID id;
    private String tenantId;
    private UUID userId;
    private BigDecimal score;
    private RiskLevel riskLevel;
    private String factors;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}




