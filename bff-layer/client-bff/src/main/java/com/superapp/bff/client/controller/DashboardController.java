package com.superapp.bff.client.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Map;

/**
 * Dashboard Controller - Enterprise Grade
 * Handles dashboard operations by proxying to Marketplace API
 * 
 * @version 1.0.0
 * @classification Production-Ready
 */
@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    @Value("${services.marketplace.url}")
    private String marketplaceUrl;

    private final RestTemplate restTemplate;

    public DashboardController() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Get dashboard summary
     * GET /api/v1/dashboard/summary
     */
    @GetMapping("/summary")
    public ResponseEntity<?> getDashboardSummary() {
        try {
            String url = marketplaceUrl + "/api/v1/dashboard/summary";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> requestEntity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                requestEntity,
                String.class
            );

            return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
            
        } catch (HttpClientErrorException e) {
            return ResponseEntity.status(e.getStatusCode()).body(Map.of(
                "error", e.getStatusText(),
                "message", e.getResponseBodyAsString()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "Internal Server Error",
                "message", "Failed to retrieve dashboard summary: " + e.getMessage()
            ));
        }
    }

    /**
     * Get recent activity
     * GET /api/v1/dashboard/activity?limit=10
     */
    @GetMapping("/activity")
    public ResponseEntity<?> getRecentActivity(
            @RequestParam(required = false, defaultValue = "10") Integer limit) {
        
        try {
            String url = UriComponentsBuilder
                .fromUriString(marketplaceUrl + "/api/v1/dashboard/activity")
                .queryParam("limit", limit)
                .toUriString();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> requestEntity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                requestEntity,
                String.class
            );

            return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
            
        } catch (HttpClientErrorException e) {
            return ResponseEntity.status(e.getStatusCode()).body(Map.of(
                "error", e.getStatusText(),
                "message", e.getResponseBodyAsString()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "Internal Server Error",
                "message", "Failed to retrieve activity: " + e.getMessage()
            ));
        }
    }

    /**
     * Get investment trends
     * GET /api/v1/dashboard/trends?period=30d
     */
    @GetMapping("/trends")
    public ResponseEntity<?> getInvestmentTrends(
            @RequestParam(required = false, defaultValue = "30d") String period) {
        
        try {
            String url = UriComponentsBuilder
                .fromUriString(marketplaceUrl + "/api/v1/dashboard/trends")
                .queryParam("period", period)
                .toUriString();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> requestEntity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                requestEntity,
                String.class
            );

            return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
            
        } catch (HttpClientErrorException e) {
            return ResponseEntity.status(e.getStatusCode()).body(Map.of(
                "error", e.getStatusText(),
                "message", e.getResponseBodyAsString()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "Internal Server Error",
                "message", "Failed to retrieve trends: " + e.getMessage()
            ));
        }
    }
}

