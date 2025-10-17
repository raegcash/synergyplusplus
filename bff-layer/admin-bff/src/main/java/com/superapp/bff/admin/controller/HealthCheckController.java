package com.superapp.bff.admin.controller;

import com.superapp.bff.admin.dto.response.ApiResponse;
import lombok.Builder;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Health check endpoint for Admin BFF
 */
@RestController
@RequestMapping("/api/v1/health")
public class HealthCheckController {
    
    @Data
    @Builder
    public static class HealthStatus {
        private String status;
        private String service;
        private String version;
        private LocalDateTime timestamp;
        private Map<String, String> dependencies;
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<HealthStatus>> healthCheck() {
        HealthStatus health = HealthStatus.builder()
                .status("UP")
                .service("admin-bff")
                .version("1.0.0")
                .timestamp(LocalDateTime.now())
                .dependencies(Map.of(
                    "identity-service", "8081",
                    "product-catalog", "8090",
                    "partner-management", "8091",
                    "risk-monitor", "8083"
                ))
                .build();
        
        return ResponseEntity.ok(ApiResponse.success(health));
    }
}

