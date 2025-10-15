package com.superapp.core.ledger.dto.request;

import com.superapp.core.ledger.domain.enums.AccountType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Request DTO for creating a new account
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateAccountRequest {

    @NotBlank(message = "Account code is required")
    private String accountCode;

    @NotBlank(message = "Account name is required")
    private String accountName;

    @NotNull(message = "Account type is required")
    private AccountType accountType;

    @NotBlank(message = "Tenant ID is required")
    private String tenantId;

    private UUID userId;  // Optional, for user-specific accounts

    @NotBlank(message = "Currency is required")
    @Builder.Default
    private String currency = "USD";

    private String description;

    private String metadata;
}




