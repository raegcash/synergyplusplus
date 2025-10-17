package com.superapp.bff.admin.controller;

import com.superapp.bff.admin.dto.response.ApiResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for HealthCheckController
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class HealthCheckControllerTest {
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Test
    void healthCheck_shouldReturnUpStatus() {
        // When
        ResponseEntity<ApiResponse<HealthCheckController.HealthStatus>> response = restTemplate.exchange(
                "/api/v1/health",
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<ApiResponse<HealthCheckController.HealthStatus>>() {}
        );
        
        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isTrue();
        assertThat(response.getBody().getData()).isNotNull();
        assertThat(response.getBody().getData().getStatus()).isEqualTo("UP");
        assertThat(response.getBody().getData().getService()).isEqualTo("admin-bff");
        assertThat(response.getBody().getData().getVersion()).isEqualTo("1.0.0");
        assertThat(response.getBody().getData().getDependencies()).isNotEmpty();
        assertThat(response.getBody().getData().getDependencies()).containsKeys(
                "identity-service",
                "product-catalog",
                "partner-management",
                "risk-monitor"
        );
    }
}

