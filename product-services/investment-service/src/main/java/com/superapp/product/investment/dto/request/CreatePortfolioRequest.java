package com.superapp.product.investment.dto.request;

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
public class CreatePortfolioRequest {

    @NotNull(message = "User ID is required")
    private UUID userId;

    @NotBlank(message = "Portfolio name is required")
    private String name;

    @NotNull(message = "Initial cash balance is required")
    private BigDecimal cashBalance;

    private String currency;

    private Boolean isDefault;
}




