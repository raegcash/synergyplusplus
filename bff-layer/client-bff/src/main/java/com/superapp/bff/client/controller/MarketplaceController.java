package com.superapp.bff.client.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

@RestController
@RequestMapping("/api/marketplace")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175"})
public class MarketplaceController {

    private final RestTemplate restTemplate;
    
    @Value("${services.marketplace:http://localhost:8085}")
    private String marketplaceUrl;

    public MarketplaceController() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Get all products
     */
    @GetMapping("/products")
    public ResponseEntity<?> getProducts(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            HttpServletRequest request) {
        try {
            StringBuilder url = new StringBuilder(marketplaceUrl + "/api/marketplace/products?");
            if (status != null) url.append("status=").append(status).append("&");
            if (category != null) url.append("category=").append(category);
            
            HttpHeaders headers = new HttpHeaders();
            copyAuthHeader(request, headers);
            
            HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(url.toString(), HttpMethod.GET, requestEntity, String.class);
            
            return ResponseEntity.status(response.getStatusCode())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response.getBody());
        } catch (HttpClientErrorException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getResponseBodyAsString());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }

    /**
     * Get product by ID
     */
    @GetMapping("/products/{id}")
    public ResponseEntity<?> getProduct(@PathVariable String id, HttpServletRequest request) {
        try {
            String url = marketplaceUrl + "/api/marketplace/products/" + id;
            
            HttpHeaders headers = new HttpHeaders();
            copyAuthHeader(request, headers);
            
            HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, requestEntity, String.class);
            
            return ResponseEntity.status(response.getStatusCode())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response.getBody());
        } catch (HttpClientErrorException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getResponseBodyAsString());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }

    /**
     * Get all assets
     */
    @GetMapping("/assets")
    public ResponseEntity<?> getAssets(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String assetType,
            HttpServletRequest request) {
        try {
            StringBuilder url = new StringBuilder(marketplaceUrl + "/api/marketplace/assets?");
            if (status != null) url.append("status=").append(status).append("&");
            if (assetType != null) url.append("assetType=").append(assetType);
            
            HttpHeaders headers = new HttpHeaders();
            copyAuthHeader(request, headers);
            
            HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(url.toString(), HttpMethod.GET, requestEntity, String.class);
            
            return ResponseEntity.status(response.getStatusCode())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response.getBody());
        } catch (HttpClientErrorException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getResponseBodyAsString());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }

    /**
     * Get asset by ID
     */
    @GetMapping("/assets/{id}")
    public ResponseEntity<?> getAsset(@PathVariable String id, HttpServletRequest request) {
        try {
            String url = marketplaceUrl + "/api/marketplace/assets/" + id;
            
            HttpHeaders headers = new HttpHeaders();
            copyAuthHeader(request, headers);
            
            HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, requestEntity, String.class);
            
            return ResponseEntity.status(response.getStatusCode())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response.getBody());
        } catch (HttpClientErrorException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getResponseBodyAsString());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }

    /**
     * Get portfolio summary for client
     */
    @GetMapping("/client/portfolio/summary")
    public ResponseEntity<?> getPortfolioSummary(HttpServletRequest request) {
        try {
            String url = marketplaceUrl + "/api/marketplace/client/portfolio/summary";
            
            HttpHeaders headers = new HttpHeaders();
            copyAuthHeader(request, headers);
            
            HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, requestEntity, String.class);
            
            return ResponseEntity.status(response.getStatusCode())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response.getBody());
        } catch (HttpClientErrorException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getResponseBodyAsString());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }

    /**
     * Get transactions
     */
    @GetMapping("/transactions/history")
    public ResponseEntity<?> getTransactionHistory(HttpServletRequest request) {
        try {
            String url = marketplaceUrl + "/api/marketplace/transactions/history";
            
            HttpHeaders headers = new HttpHeaders();
            copyAuthHeader(request, headers);
            
            HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, requestEntity, String.class);
            
            return ResponseEntity.status(response.getStatusCode())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response.getBody());
        } catch (HttpClientErrorException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getResponseBodyAsString());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }

    /**
     * Helper method to copy Authorization header
     */
    private void copyAuthHeader(HttpServletRequest request, HttpHeaders headers) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null) {
            headers.set("Authorization", authHeader);
        }
    }
}

