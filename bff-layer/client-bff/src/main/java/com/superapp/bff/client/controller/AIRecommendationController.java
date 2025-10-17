package com.superapp.bff.client.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;

/**
 * AI Recommendation Controller - Enterprise Grade
 * Proxies AI recommendation requests to the AI Service
 * 
 * @version 1.0.0
 * @classification Production-Ready
 */
@RestController
@RequestMapping("/api/v1/ai")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:4000"})
public class AIRecommendationController {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${ai.service.base-url:http://localhost:8086}")
    private String aiServiceBaseUrl;

    /**
     * Get personalized recommendations
     */
    @PostMapping("/recommendations")
    public ResponseEntity<Object> getRecommendations(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Object requestBody) {
        try {
            String url = aiServiceBaseUrl + "/api/ai/recommendations";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Object> entity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<Object> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                Object.class
            );
            
            return response;
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getResponseBodyAsString());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("{\"error\": \"Failed to get recommendations\", \"details\": \"" + e.getMessage() + "\"}");
        }
    }

    /**
     * Get smart insights
     */
    @PostMapping("/insights")
    public ResponseEntity<Object> getInsights(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Object requestBody) {
        try {
            String url = aiServiceBaseUrl + "/api/ai/insights";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Object> entity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<Object> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                Object.class
            );
            
            return response;
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getResponseBodyAsString());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("{\"error\": \"Failed to get insights\", \"details\": \"" + e.getMessage() + "\"}");
        }
    }

    /**
     * Get profile analysis
     */
    @PostMapping("/profile-analysis")
    public ResponseEntity<Object> analyzeProfile(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Object requestBody) {
        try {
            String url = aiServiceBaseUrl + "/api/ai/profile-analysis";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Object> entity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<Object> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                Object.class
            );
            
            return response;
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getResponseBodyAsString());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("{\"error\": \"Failed to analyze profile\", \"details\": \"" + e.getMessage() + "\"}");
        }
    }

    /**
     * Get trending assets
     */
    @GetMapping("/trending-assets")
    public ResponseEntity<Object> getTrendingAssets(
            @RequestParam(defaultValue = "5") int limit) {
        try {
            String url = aiServiceBaseUrl + "/api/ai/trending-assets?limit=" + limit;
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<Object> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                Object.class
            );
            
            return response;
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getResponseBodyAsString());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("{\"error\": \"Failed to get trending assets\", \"details\": \"" + e.getMessage() + "\"}");
        }
    }

    /**
     * Get market sentiment
     */
    @GetMapping("/market-sentiment")
    public ResponseEntity<Object> getMarketSentiment() {
        try {
            String url = aiServiceBaseUrl + "/api/ai/market-sentiment";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<Object> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                Object.class
            );
            
            return response;
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getResponseBodyAsString());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("{\"error\": \"Failed to get market sentiment\", \"details\": \"" + e.getMessage() + "\"}");
        }
    }

    /**
     * Health check for AI service
     */
    @GetMapping("/health")
    public ResponseEntity<Object> healthCheck() {
        try {
            String url = aiServiceBaseUrl + "/api/ai/health";
            
            ResponseEntity<Object> response = restTemplate.getForEntity(url, Object.class);
            return response;
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body("{\"status\": \"unavailable\", \"message\": \"AI service is not available\"}");
        }
    }
}

