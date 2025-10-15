package com.superapp.product.lending.domain.entity;

import com.superapp.product.lending.domain.enums.LoanStatus;
import com.superapp.product.lending.domain.enums.LoanType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "loans", indexes = {
    @Index(name = "idx_tenant_user", columnList = "tenantId,userId"),
    @Index(name = "idx_status", columnList = "status"),
    @Index(name = "idx_application", columnList = "applicationId")
})
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Loan extends AuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String tenantId;

    @Column(nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private UUID applicationId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LoanType loanType;

    @Column(precision = 19, scale = 4, nullable = false)
    private BigDecimal principalAmount;

    @Column(precision = 19, scale = 4, nullable = false)
    private BigDecimal outstandingBalance;

    @Column(precision = 5, scale = 2, nullable = false)
    private BigDecimal interestRate;

    @Column(nullable = false)
    private Integer termMonths;

    @Column(precision = 19, scale = 4, nullable = false)
    private BigDecimal monthlyPayment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LoanStatus status;

    @Column(nullable = false)
    private LocalDate startDate;

    private LocalDate maturityDate;

    private LocalDate nextPaymentDate;

    @Column(precision = 19, scale = 4)
    private BigDecimal totalPaid;

    @Column(precision = 19, scale = 4)
    private BigDecimal totalInterestPaid;
}

