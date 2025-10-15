package com.superapp.core.payment.domain.entity;

import com.superapp.core.payment.domain.enums.PaymentProvider;
import com.superapp.core.payment.domain.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Payment transaction entity
 */
@Entity
@Table(name = "payment_transactions", indexes = {
    @Index(name = "idx_tenant_user", columnList = "tenantId,userId"),
    @Index(name = "idx_status", columnList = "status"),
    @Index(name = "idx_provider", columnList = "provider"),
    @Index(name = "idx_external_ref", columnList = "externalReference")
})
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentTransaction extends AuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String tenantId;

    @Column(nullable = false)
    private UUID userId;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;

    @Column(nullable = false, length = 3)
    private String currency;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PaymentProvider provider;

    @Column(length = 100)
    private String externalReference;

    @Column(length = 100)
    private String paymentMethodId;

    @Column(columnDefinition = "TEXT")
    private String metadata;

    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    private LocalDateTime completedAt;

    private LocalDateTime failedAt;
}




