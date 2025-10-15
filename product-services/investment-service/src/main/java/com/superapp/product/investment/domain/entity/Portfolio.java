package com.superapp.product.investment.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "portfolios", indexes = {
    @Index(name = "idx_tenant_user", columnList = "tenantId,userId")
})
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Portfolio extends AuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String tenantId;

    @Column(nullable = false)
    private UUID userId;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(precision = 19, scale = 4, nullable = false)
    private BigDecimal totalValue;

    @Column(precision = 19, scale = 4, nullable = false)
    private BigDecimal cashBalance;

    @Column(precision = 19, scale = 4)
    private BigDecimal totalProfitLoss;

    @Column(precision = 10, scale = 4)
    private BigDecimal totalReturnPercent;

    @Column(length = 3)
    private String currency;

    @Column(nullable = false)
    private Boolean isDefault;

    @Column(nullable = false)
    private Boolean isActive;
}




