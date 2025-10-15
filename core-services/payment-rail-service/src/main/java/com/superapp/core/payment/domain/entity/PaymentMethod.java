package com.superapp.core.payment.domain.entity;

import com.superapp.core.payment.domain.enums.PaymentMethodType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.UUID;

/**
 * Saved payment method entity
 */
@Entity
@Table(name = "payment_methods", indexes = {
    @Index(name = "idx_tenant_user", columnList = "tenantId,userId"),
    @Index(name = "idx_default", columnList = "isDefault")
})
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentMethod extends AuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String tenantId;

    @Column(nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PaymentMethodType type;

    @Column(length = 100)
    private String displayName;

    @Column(length = 10)
    private String lastFour;

    @Column(length = 50)
    private String expiryMonth;

    @Column(length = 50)
    private String expiryYear;

    @Column(nullable = false)
    private Boolean isDefault = false;

    @Column(nullable = false)
    private Boolean isActive = true;

    @Column(columnDefinition = "TEXT")
    private String encryptedData;
}




