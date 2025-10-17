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
 * Transaction Controller - Enterprise Grade
 * Handles transaction operations by proxying to Marketplace API
 * 
 * @version 1.0.0
 * @classification Production-Ready
 */
@RestController
@RequestMapping("/api/v1/transactions")
public class TransactionController {

    @Value("${services.marketplace.url}")
    private String marketplaceUrl;

    private final RestTemplate restTemplate;

    public TransactionController() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Get customer transactions with filtering and pagination
     * GET /api/v1/transactions?type=INVESTMENT&status=COMPLETED&limit=50&offset=0
     */
    @GetMapping
    public ResponseEntity<?> getTransactions(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String assetId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "50") Integer limit,
            @RequestParam(required = false, defaultValue = "0") Integer offset,
            @RequestParam(required = false, defaultValue = "transaction_date") String sortBy,
            @RequestParam(required = false, defaultValue = "DESC") String sortOrder) {
        
        try {
            UriComponentsBuilder builder = UriComponentsBuilder
                .fromUriString(marketplaceUrl + "/api/v1/transactions")
                .queryParam("limit", limit)
                .queryParam("offset", offset)
                .queryParam("sortBy", sortBy)
                .queryParam("sortOrder", sortOrder);

            if (type != null) builder.queryParam("type", type);
            if (status != null) builder.queryParam("status", status);
            if (assetId != null) builder.queryParam("assetId", assetId);
            if (startDate != null) builder.queryParam("startDate", startDate);
            if (endDate != null) builder.queryParam("endDate", endDate);
            if (search != null) builder.queryParam("search", search);

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
                "message", "Failed to retrieve transactions: " + e.getMessage()
            ));
        }
    }

    /**
     * Get transaction details
     * GET /api/v1/transactions/:id
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getTransactionById(@PathVariable String id) {
        try {
            String url = marketplaceUrl + "/api/v1/transactions/" + id;

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
                "message", "Failed to retrieve transaction: " + e.getMessage()
            ));
        }
    }

    /**
     * Get transaction statistics
     * GET /api/v1/transactions/statistics?period=30d
     */
    @GetMapping("/statistics")
    public ResponseEntity<?> getTransactionStatistics(
            @RequestParam(required = false, defaultValue = "30d") String period) {
        
        try {
            String url = UriComponentsBuilder
                .fromUriString(marketplaceUrl + "/api/v1/transactions/statistics")
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
                "message", "Failed to retrieve statistics: " + e.getMessage()
            ));
        }
    }
}

