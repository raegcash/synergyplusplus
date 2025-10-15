package com.superapp.core.risk;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Risk Monitor Service Application
 */
@SpringBootApplication
@EnableJpaAuditing
public class RiskMonitorServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(RiskMonitorServiceApplication.class, args);
    }
}




