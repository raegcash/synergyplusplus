package com.superapp.core.risk.domain.entity;

import com.superapp.core.risk.domain.enums.RiskLevel;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "risk_scores", indexes = {
    @Index(name = "idx_tenant_user", columnList = "tenantId,userId"),
    @Index(name = "idx_risk_level", columnList = "riskLevel")
})
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class RiskScore extends AuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String tenantId;

    @Column(nullable = false)
    private UUID userId;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal score;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RiskLevel riskLevel;

    @Column(columnDefinition = "TEXT")
    private String factors;

    @Column(columnDefinition = "TEXT")
    private String metadata;
}




