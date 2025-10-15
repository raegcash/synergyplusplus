package com.superapp.product.investment.dto.response;

import com.superapp.product.investment.domain.enums.AssetType;
import com.superapp.product.investment.domain.enums.PositionStatus;
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
public class PositionResponse {

    private UUID id;
    private UUID portfolioId;
    private String symbol;
    private AssetType assetType;
    private BigDecimal quantity;
    private BigDecimal averagePrice;
    private BigDecimal currentPrice;
    private BigDecimal marketValue;
    private BigDecimal profitLoss;
    private BigDecimal returnPercent;
    private PositionStatus status;
    private LocalDateTime openedAt;
    private LocalDateTime closedAt;
    private LocalDateTime createdAt;
}




