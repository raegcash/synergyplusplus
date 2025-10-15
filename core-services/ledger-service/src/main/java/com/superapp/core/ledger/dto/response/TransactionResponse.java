package com.superapp.core.ledger.dto.response;

import com.superapp.core.ledger.domain.enums.TransactionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Response DTO for transaction information
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponse {

    private UUID id;
    private String transactionNumber;
    private String tenantId;
    private LocalDateTime transactionDate;
    private TransactionStatus status;
    private String description;
    private String referenceId;
    private String referenceType;
    private BigDecimal totalAmount;
    private String currency;
    private List<TransactionEntryResponse> entries;
    private LocalDateTime createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransactionEntryResponse {
        private UUID id;
        private String accountCode;
        private String accountName;
        private String entryType;
        private BigDecimal amount;
        private BigDecimal balanceAfter;
        private String description;
    }
}




