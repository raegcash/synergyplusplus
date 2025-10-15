package com.superapp.product.lending.domain.entity;

import com.superapp.product.lending.domain.enums.LoanStatus;
import com.superapp.product.lending.domain.enums.LoanType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "loan_applications", indexes = {
    @Index(name = "idx_tenant_user", columnList = "tenantId,userId"),
    @Index(name = "idx_status", columnList = "status")
})
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class LoanApplication extends AuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String tenantId;

    @Column(nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LoanType loanType;

    @Column(precision = 19, scale = 4, nullable = false)
    private BigDecimal requestedAmount;

    @Column(nullable = false)
    private Integer termMonths;

    @Column(precision = 5, scale = 2)
    private BigDecimal proposedInterestRate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LoanStatus status;

    @Column(precision = 5, scale = 2)
    private BigDecimal creditScore;

    @Column(precision = 19, scale = 4)
    private BigDecimal monthlyIncome;

    @Column(precision = 19, scale = 4)
    private BigDecimal existingDebts;

    @Column(length = 200)
    private String purpose;

    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(columnDefinition = "TEXT")
    private String metadata;
}




