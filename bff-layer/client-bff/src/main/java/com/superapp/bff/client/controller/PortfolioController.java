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
 * Portfolio Controller - Enterprise Grade
 * Handles portfolio operations by proxying to Marketplace API
 * 
 * @version 1.0.0
 * @classification Production-Ready
 */
@RestController
@RequestMapping("/api/v1/portfolio")
public class PortfolioController {

    @Value("${services.marketplace.url}")
    private String marketplaceUrl;

    private final RestTemplate restTemplate;

    public PortfolioController() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Get portfolio summary
     * GET /api/v1/portfolio/summary
     * 
     * @return Portfolio summary with holdings, performance, and allocation
     */
    @GetMapping("/summary")
    public ResponseEntity<?> getPortfolioSummary() {
        try {
            String url = marketplaceUrl + "/api/v1/portfolio/summary";

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
                "message", "Failed to retrieve portfolio summary: " + e.getMessage()
            ));
        }
    }

    /**
     * Get portfolio holdings
     * GET /api/v1/portfolio/holdings?assetType=UITF&sortBy=total_invested&sortOrder=DESC
     * 
     * @param assetType Filter by asset type (optional)
     * @param sortBy Sort field (default: total_invested)
     * @param sortOrder Sort order (default: DESC)
     * @return List of portfolio holdings
     */
    @GetMapping("/holdings")
    public ResponseEntity<?> getPortfolioHoldings(
            @RequestParam(required = false) String assetType,
            @RequestParam(required = false, defaultValue = "total_invested") String sortBy,
            @RequestParam(required = false, defaultValue = "DESC") String sortOrder) {
        
        try {
            UriComponentsBuilder builder = UriComponentsBuilder
                .fromUriString(marketplaceUrl + "/api/v1/portfolio/holdings")
                .queryParam("sortBy", sortBy)
                .queryParam("sortOrder", sortOrder);

            if (assetType != null && !assetType.isEmpty()) {
                builder.queryParam("assetType", assetType);
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> requestEntity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(
                builder.toUriString(),
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
                "message", "Failed to retrieve portfolio holdings: " + e.getMessage()
            ));
        }
    }

    /**
     * Get portfolio performance
     * GET /api/v1/portfolio/performance?period=30d
     * 
     * @param period Time period (7d, 30d, 90d, 1y, all)
     * @return Portfolio performance metrics
     */
    @GetMapping("/performance")
    public ResponseEntity<?> getPortfolioPerformance(
            @RequestParam(required = false, defaultValue = "30d") String period) {
        
        try {
            String url = UriComponentsBuilder
                .fromUriString(marketplaceUrl + "/api/v1/portfolio/performance")
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
                "message", "Failed to retrieve portfolio performance: " + e.getMessage()
            ));
        }
    }

    /**
     * Get specific asset holding details
     * GET /api/v1/portfolio/holdings/:assetId
     * 
     * @param assetId Asset ID
     * @return Asset holding details with investment history
     */
    @GetMapping("/holdings/{assetId}")
    public ResponseEntity<?> getAssetHolding(@PathVariable String assetId) {
        try {
            String url = marketplaceUrl + "/api/v1/portfolio/holdings/" + assetId;

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
                "message", "Failed to retrieve asset holding: " + e.getMessage()
            ));
        }
    }
}

