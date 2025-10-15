package com.superapp.core.ledger.domain.entity;

import com.superapp.core.ledger.domain.enums.TransactionStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Transaction Entity - Represents a financial transaction
 * 
 * Each transaction contains multiple entries (debits and credits)
 * that must balance (total debits = total credits)
 */
@Entity
@Table(name = "transactions", indexes = {
    @Index(name = "idx_transaction_tenant", columnList = "tenantId"),
    @Index(name = "idx_transaction_ref", columnList = "referenceId"),
    @Index(name = "idx_transaction_date", columnList = "transactionDate"),
    @Index(name = "idx_transaction_status", columnList = "status")
})
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Transaction extends AuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String transactionNumber;

    @Column(nullable = false)
    private String tenantId;

    @Column(nullable = false)
    private LocalDateTime transactionDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TransactionStatus status = TransactionStatus.PENDING;

    @Column(nullable = false)
    private String description;

    /**
     * Reference to external entity (e.g., order ID, payment ID)
     */
    @Column
    private String referenceId;

    /**
     * Reference type (e.g., "ORDER", "PAYMENT", "TRANSFER")
     */
    @Column
    private String referenceType;

    /**
     * Total amount of the transaction
     */
    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal totalAmount;

    /**
     * Currency code (ISO 4217)
     */
    @Column(nullable = false, length = 3)
    @Builder.Default
    private String currency = "USD";

    /**
     * Transaction entries (debits and credits)
     */
    @OneToMany(mappedBy = "transaction", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TransactionEntry> entries = new ArrayList<>();

    /**
     * Metadata for extensibility (stored as JSON)
     */
    @Column(columnDefinition = "jsonb")
    private String metadata;

    // Helper methods
    public void addEntry(TransactionEntry entry) {
        entries.add(entry);
        entry.setTransaction(this);
    }

    public void removeEntry(TransactionEntry entry) {
        entries.remove(entry);
        entry.setTransaction(null);
    }

    public BigDecimal getTotalDebits() {
        return entries.stream()
                .filter(e -> e.getEntryType() == com.superapp.core.ledger.domain.enums.EntryType.DEBIT)
                .map(TransactionEntry::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal getTotalCredits() {
        return entries.stream()
                .filter(e -> e.getEntryType() == com.superapp.core.ledger.domain.enums.EntryType.CREDIT)
                .map(TransactionEntry::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public boolean isBalanced() {
        return getTotalDebits().compareTo(getTotalCredits()) == 0;
    }
}




