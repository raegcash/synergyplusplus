package com.superapp.core.ledger.domain.entity;

import com.superapp.core.ledger.domain.enums.AccountType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Account Entity - Represents ledger accounts
 * 
 * Accounts follow double-entry bookkeeping principles:
 * - Assets & Expenses have DEBIT normal balance
 * - Liabilities, Equity & Revenue have CREDIT normal balance
 */
@Entity
@Table(name = "accounts", indexes = {
    @Index(name = "idx_account_code", columnList = "accountCode"),
    @Index(name = "idx_account_tenant", columnList = "tenantId"),
    @Index(name = "idx_account_user", columnList = "userId")
})
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Account extends AuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String accountCode;

    @Column(nullable = false)
    private String accountName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccountType accountType;

    @Column(nullable = false)
    private String tenantId;

    /**
     * User ID if this is a user-specific account (e.g., user wallet)
     * NULL for system accounts
     */
    @Column
    private UUID userId;

    /**
     * Current balance (computed from transactions)
     */
    @Column(nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal balance = BigDecimal.ZERO;

    /**
     * Currency code (ISO 4217)
     */
    @Column(nullable = false, length = 3)
    @Builder.Default
    private String currency = "USD";

    @Column
    private String description;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    /**
     * Metadata for extensibility (stored as JSON)
     */
    @Column(columnDefinition = "jsonb")
    private String metadata;

    // Helper methods
    public void debit(BigDecimal amount) {
        if (hasDebitNormalBalance()) {
            this.balance = this.balance.add(amount);
        } else {
            this.balance = this.balance.subtract(amount);
        }
    }

    public void credit(BigDecimal amount) {
        if (hasDebitNormalBalance()) {
            this.balance = this.balance.subtract(amount);
        } else {
            this.balance = this.balance.add(amount);
        }
    }

    private boolean hasDebitNormalBalance() {
        return accountType == AccountType.ASSET || accountType == AccountType.EXPENSE;
    }
}




