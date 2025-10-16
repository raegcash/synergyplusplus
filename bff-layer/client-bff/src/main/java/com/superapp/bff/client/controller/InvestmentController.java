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
 * Investment Controller - Enterprise Grade
 * Handles investment operations by proxying to Marketplace API
 * 
 * @version 1.0.0
 * @classification Production-Ready
 */
@RestController
@RequestMapping("/api/v1/investments")
public class InvestmentController {

    @Value("${services.marketplace.url}")
    private String marketplaceUrl;

    private final RestTemplate restTemplate;

    public InvestmentController() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Create a new investment
     * POST /api/v1/investments
     * 
     * @param investmentData Investment details (customerId, assetId, amount, paymentMethod)
     * @return Investment creation response
     */
    @PostMapping
    public ResponseEntity<?> createInvestment(@RequestBody Map<String, Object> investmentData) {
        try {
            String url = marketplaceUrl + "/api/v1/investments";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(investmentData, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

            return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
            
        } catch (HttpClientErrorException e) {
            return ResponseEntity.status(e.getStatusCode()).body(Map.of(
                "error", e.getStatusText(),
                "message", e.getResponseBodyAsString()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "Internal Server Error",
                "message", "Failed to create investment: " + e.getMessage()
            ));
        }
    }

    /**
     * Get customer's investments
     * GET /api/v1/investments?status=PENDING&limit=50&offset=0
     * 
     * @param customerId Customer ID (from JWT or query)
     * @param status Filter by status (optional)
     * @param limit Number of records (default: 50)
     * @param offset Pagination offset (default: 0)
     * @param sortBy Sort field (default: investment_date)
     * @param sortOrder Sort order (default: DESC)
     * @return List of investments
     */
    @GetMapping
    public ResponseEntity<?> getInvestments(
            @RequestParam(required = false) String customerId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String assetId,
            @RequestParam(defaultValue = "50") Integer limit,
            @RequestParam(defaultValue = "0") Integer offset,
            @RequestParam(defaultValue = "investment_date") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortOrder) {
        
        try {
            UriComponentsBuilder builder = UriComponentsBuilder
                .fromUriString(marketplaceUrl + "/api/v1/investments")
                .queryParam("limit", limit)
                .queryParam("offset", offset)
                .queryParam("sortBy", sortBy)
                .queryParam("sortOrder", sortOrder);

            if (customerId != null) builder.queryParam("customerId", customerId);
            if (status != null) builder.queryParam("status", status);
            if (assetId != null) builder.queryParam("assetId", assetId);

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
                "message", "Failed to retrieve investments: " + e.getMessage()
            ));
        }
    }

    /**
     * Get investment by ID
     * GET /api/v1/investments/:id
     * 
     * @param id Investment ID
     * @param customerId Customer ID (from JWT or query)
     * @return Investment details
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getInvestmentById(
            @PathVariable String id,
            @RequestParam(required = false) String customerId) {
        
        try {
            UriComponentsBuilder builder = UriComponentsBuilder
                .fromUriString(marketplaceUrl + "/api/v1/investments/" + id);

            if (customerId != null) {
                builder.queryParam("customerId", customerId);
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
                "message", "Failed to retrieve investment: " + e.getMessage()
            ));
        }
    }

    /**
     * Cancel an investment
     * PATCH /api/v1/investments/:id/cancel
     * 
     * @param id Investment ID
     * @param cancelData Cancellation details (reason)
     * @return Cancellation response
     */
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<?> cancelInvestment(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, Object> cancelData) {
        
        try {
            String url = marketplaceUrl + "/api/v1/investments/" + id + "/cancel";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            if (cancelData == null) {
                cancelData = Map.of();
            }

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(cancelData, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                url,
                HttpMethod.PATCH,
                request,
                Map.class
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
                "message", "Failed to cancel investment: " + e.getMessage()
            ));
        }
    }

    /**
     * Get investment summary/statistics
     * GET /api/v1/investments/summary/stats
     * 
     * @param customerId Customer ID (from JWT or query)
     * @return Investment summary statistics
     */
    @GetMapping("/summary/stats")
    public ResponseEntity<?> getInvestmentSummary(
            @RequestParam(required = false) String customerId) {
        
        try {
            UriComponentsBuilder builder = UriComponentsBuilder
                .fromUriString(marketplaceUrl + "/api/v1/investments/summary/stats");

            if (customerId != null) {
                builder.queryParam("customerId", customerId);
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
                "message", "Failed to retrieve investment summary: " + e.getMessage()
            ));
        }
    }
}

