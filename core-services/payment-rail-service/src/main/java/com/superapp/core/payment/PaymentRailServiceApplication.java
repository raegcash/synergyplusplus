package com.superapp.core.payment;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Payment Rail Service - Core Foundation Service
 * 
 * Provides:
 * - Payment processing orchestration
 * - Multi-provider support (Stripe, PayPal, etc.)
 * - Payment method management
 * - Transaction tracking and reconciliation
 * - Webhook handling
 * - Refund and chargeback processing
 * 
 * This is a foundational operational utility for all payment operations.
 */
@SpringBootApplication
@EnableJpaAuditing
@EnableCaching
public class PaymentRailServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(PaymentRailServiceApplication.class, args);
    }
}

