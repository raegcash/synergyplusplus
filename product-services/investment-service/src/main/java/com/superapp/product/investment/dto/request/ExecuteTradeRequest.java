package com.superapp.product.investment.dto.request;

import com.superapp.product.investment.domain.enums.AssetType;
import com.superapp.product.investment.domain.enums.TradeType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExecuteTradeRequest {

    @NotNull(message = "Portfolio ID is required")
    private UUID portfolioId;

    @NotBlank(message = "Symbol is required")
    private String symbol;

    @NotNull(message = "Asset type is required")
    private AssetType assetType;

    @NotNull(message = "Trade type is required")
    private TradeType tradeType;

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.00000001", message = "Quantity must be greater than 0")
    private BigDecimal quantity;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    private BigDecimal price;

    private String notes;
}




