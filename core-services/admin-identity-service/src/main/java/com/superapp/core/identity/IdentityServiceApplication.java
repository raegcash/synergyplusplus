package com.superapp.core.identity;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Identity Service - Core Foundation Service
 * 
 * Provides:
 * - User authentication & authorization
 * - JWT token management
 * - Multi-tenant user management
 * - Role-based access control (RBAC)
 * - Basic KYC workflow
 * 
 * This is a foundational operational utility consumed by all other services.
 */
@SpringBootApplication
@EnableJpaAuditing
@EnableCaching
public class IdentityServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(IdentityServiceApplication.class, args);
    }
}

