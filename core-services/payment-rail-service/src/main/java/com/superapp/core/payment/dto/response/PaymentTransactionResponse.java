package com.superapp.core.payment.dto.response;

import com.superapp.core.payment.domain.enums.PaymentProvider;
import com.superapp.core.payment.domain.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Payment transaction response DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentTransactionResponse {

    private UUID id;
    private String tenantId;
    private UUID userId;
    private BigDecimal amount;
    private String currency;
    private PaymentStatus status;
    private PaymentProvider provider;
    private String externalReference;
    private String paymentMethodId;
    private String errorMessage;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}




