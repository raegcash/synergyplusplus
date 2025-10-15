package com.superapp.product.lending.domain.entity;

import com.superapp.product.lending.domain.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "loan_payments", indexes = {
    @Index(name = "idx_loan", columnList = "loanId"),
    @Index(name = "idx_due_date", columnList = "dueDate"),
    @Index(name = "idx_status", columnList = "status")
})
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class LoanPayment extends AuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID loanId;

    @Column(nullable = false)
    private Integer paymentNumber;

    @Column(precision = 19, scale = 4, nullable = false)
    private BigDecimal amountDue;

    @Column(precision = 19, scale = 4)
    private BigDecimal amountPaid;

    @Column(precision = 19, scale = 4)
    private BigDecimal principalAmount;

    @Column(precision = 19, scale = 4)
    private BigDecimal interestAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentStatus status;

    @Column(nullable = false)
    private LocalDate dueDate;

    private LocalDate paidDate;

    @Column(precision = 19, scale = 4)
    private BigDecimal lateFee;

    @Column(columnDefinition = "TEXT")
    private String notes;
}




