package com.superapp.marketplace.partner;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Partner Management Service Application
 * Includes Partner Management + Integrated Hypercare capabilities
 */
@SpringBootApplication
@EnableJpaAuditing
public class PartnerManagementServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(PartnerManagementServiceApplication.class, args);
    }
}




