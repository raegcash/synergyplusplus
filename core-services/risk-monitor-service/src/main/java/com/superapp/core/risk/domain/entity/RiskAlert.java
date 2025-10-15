package com.superapp.core.risk.domain.entity;

import com.superapp.core.risk.domain.enums.AlertStatus;
import com.superapp.core.risk.domain.enums.RiskLevel;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.UUID;

@Entity
@Table(name = "risk_alerts", indexes = {
    @Index(name = "idx_tenant_user", columnList = "tenantId,userId"),
    @Index(name = "idx_risk_level", columnList = "riskLevel"),
    @Index(name = "idx_status", columnList = "status"),
    @Index(name = "idx_created_at", columnList = "createdAt")
})
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class RiskAlert extends AuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String tenantId;

    @Column(nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RiskLevel riskLevel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AlertStatus status;

    @Column(nullable = false, length = 200)
    private String alertType;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 100)
    private String entityType;

    private UUID entityId;

    @Column(columnDefinition = "TEXT")
    private String metadata;

    @Column(length = 100)
    private String assignedTo;
}




