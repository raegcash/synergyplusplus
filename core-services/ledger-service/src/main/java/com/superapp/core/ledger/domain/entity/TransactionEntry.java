package com.superapp.core.ledger.domain.entity;

import com.superapp.core.ledger.domain.enums.EntryType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Transaction Entry Entity - Individual debit or credit entry
 * 
 * Part of double-entry bookkeeping:
 * - Every transaction has at least 2 entries
 * - Total debits must equal total credits
 * - Entries are immutable once posted
 */
@Entity
@Table(name = "transaction_entries", indexes = {
    @Index(name = "idx_entry_transaction", columnList = "transaction_id"),
    @Index(name = "idx_entry_account", columnList = "account_id")
})
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionEntry extends AuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id", nullable = false)
    private Transaction transaction;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EntryType entryType;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;

    @Column
    private String description;

    /**
     * Snapshot of account balance after this entry
     */
    @Column(precision = 19, scale = 4)
    private BigDecimal balanceAfter;
}




