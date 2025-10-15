package com.superapp.product.savings;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Savings Service Application - Digital wallet and savings accounts
 */
@SpringBootApplication
@EnableJpaAuditing
public class SavingsServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(SavingsServiceApplication.class, args);
    }
}




