package com.superapp.product.investment.dto.response;

import com.superapp.product.investment.domain.enums.AssetType;
import com.superapp.product.investment.domain.enums.TradeType;
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
public class TradeResponse {

    private UUID id;
    private UUID portfolioId;
    private UUID positionId;
    private String symbol;
    private AssetType assetType;
    private TradeType tradeType;
    private BigDecimal quantity;
    private BigDecimal price;
    private BigDecimal totalAmount;
    private BigDecimal fees;
    private LocalDateTime executedAt;
    private String notes;
    private LocalDateTime createdAt;
}




