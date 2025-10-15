package com.superapp.core.ledger;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Ledger Service - Core Foundation Service
 * 
 * Provides:
 * - Double-entry bookkeeping system
 * - Account management (assets, liabilities, equity, revenue, expenses)
 * - Transaction recording with audit trail
 * - Balance calculations and reporting
 * - Multi-currency support
 * - Immutable transaction history
 * 
 * This is a foundational operational utility for all financial operations.
 */
@SpringBootApplication
@EnableJpaAuditing
@EnableCaching
public class LedgerServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(LedgerServiceApplication.class, args);
    }
}

