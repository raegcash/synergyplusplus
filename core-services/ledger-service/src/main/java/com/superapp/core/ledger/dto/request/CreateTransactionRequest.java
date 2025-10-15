package com.superapp.core.ledger.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Request DTO for creating a new transaction
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTransactionRequest {

    @NotBlank(message = "Tenant ID is required")
    private String tenantId;

    @NotNull(message = "Transaction date is required")
    private LocalDateTime transactionDate;

    @NotBlank(message = "Description is required")
    private String description;

    private String referenceId;
    private String referenceType;

    @NotNull(message = "Total amount is required")
    private BigDecimal totalAmount;

    @NotBlank(message = "Currency is required")
    @Builder.Default
    private String currency = "USD";

    @NotEmpty(message = "Transaction entries are required")
    @Valid
    private List<TransactionEntryRequest> entries;

    private String metadata;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransactionEntryRequest {
        @NotBlank(message = "Account code is required")
        private String accountCode;

        @NotBlank(message = "Entry type is required (DEBIT or CREDIT)")
        private String entryType;

        @NotNull(message = "Amount is required")
        private BigDecimal amount;

        private String description;
    }
}




