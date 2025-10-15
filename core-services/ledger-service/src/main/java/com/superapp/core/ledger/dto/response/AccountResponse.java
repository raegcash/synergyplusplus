package com.superapp.core.ledger.dto.response;

import com.superapp.core.ledger.domain.enums.AccountType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response DTO for account information
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountResponse {

    private UUID id;
    private String accountCode;
    private String accountName;
    private AccountType accountType;
    private String tenantId;
    private UUID userId;
    private BigDecimal balance;
    private String currency;
    private String description;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}




