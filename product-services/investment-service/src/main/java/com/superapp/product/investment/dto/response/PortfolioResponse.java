package com.superapp.product.investment.dto.response;

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
public class PortfolioResponse {

    private UUID id;
    private String tenantId;
    private UUID userId;
    private String name;
    private BigDecimal totalValue;
    private BigDecimal cashBalance;
    private BigDecimal totalProfitLoss;
    private BigDecimal totalReturnPercent;
    private String currency;
    private Boolean isDefault;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}




