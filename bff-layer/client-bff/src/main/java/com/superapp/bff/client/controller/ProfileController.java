package com.superapp.bff.client.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;

/**
 * Profile Controller - Enterprise Grade
 * Proxies profile and KYC requests to the Marketplace API
 * 
 * @version 1.0.0
 * @classification Production-Ready
 */
@RestController
@RequestMapping("/api/v1/profile")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:4000"})
public class ProfileController {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${marketplace.api.base-url}")
    private String marketplaceApiBaseUrl;

    /**
     * Get customer profile
     */
    @GetMapping
    public ResponseEntity<Object> getProfile(@RequestHeader("Authorization") String authHeader) {
        try {
            String url = marketplaceApiBaseUrl + "/api/v1/profile";
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", authHeader);
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
                .body("{\"error\": \"Failed to get profile\", \"details\": \"" + e.getMessage() + "\"}");
        }
    }

    /**
     * Update customer profile
     */
    @PutMapping
    public ResponseEntity<Object> updateProfile(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Object profileData) {
        try {
            String url = marketplaceApiBaseUrl + "/api/v1/profile";
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", authHeader);
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Object> entity = new HttpEntity<>(profileData, headers);
            
            ResponseEntity<Object> response = restTemplate.exchange(
                url,
                HttpMethod.PUT,
                entity,
                Object.class
            );
            
            return response;
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getResponseBodyAsString());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("{\"error\": \"Failed to update profile\", \"details\": \"" + e.getMessage() + "\"}");
        }
    }

    /**
     * Get profile completion status
     */
    @GetMapping("/completion")
    public ResponseEntity<Object> getProfileCompletion(@RequestHeader("Authorization") String authHeader) {
        try {
            String url = marketplaceApiBaseUrl + "/api/v1/profile/completion";
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", authHeader);
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
                .body("{\"error\": \"Failed to get completion status\", \"details\": \"" + e.getMessage() + "\"}");
        }
    }

    /**
     * Upload KYC document
     */
    @PostMapping("/kyc/documents")
    public ResponseEntity<Object> uploadKYCDocument(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Object documentData) {
        try {
            String url = marketplaceApiBaseUrl + "/api/v1/profile/kyc/documents";
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", authHeader);
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Object> entity = new HttpEntity<>(documentData, headers);
            
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
                .body("{\"error\": \"Failed to upload document\", \"details\": \"" + e.getMessage() + "\"}");
        }
    }

    /**
     * Get KYC documents
     */
    @GetMapping("/kyc/documents")
    public ResponseEntity<Object> getKYCDocuments(@RequestHeader("Authorization") String authHeader) {
        try {
            String url = marketplaceApiBaseUrl + "/api/v1/profile/kyc/documents";
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", authHeader);
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
                .body("{\"error\": \"Failed to get documents\", \"details\": \"" + e.getMessage() + "\"}");
        }
    }

    /**
     * Submit KYC for review
     */
    @PostMapping("/kyc/submit")
    public ResponseEntity<Object> submitKYC(@RequestHeader("Authorization") String authHeader) {
        try {
            String url = marketplaceApiBaseUrl + "/api/v1/profile/kyc/submit";
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", authHeader);
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
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
                .body("{\"error\": \"Failed to submit KYC\", \"details\": \"" + e.getMessage() + "\"}");
        }
    }

    /**
     * Get KYC status
     */
    @GetMapping("/kyc/status")
    public ResponseEntity<Object> getKYCStatus(@RequestHeader("Authorization") String authHeader) {
        try {
            String url = marketplaceApiBaseUrl + "/api/v1/profile/kyc/status";
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", authHeader);
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
                .body("{\"error\": \"Failed to get KYC status\", \"details\": \"" + e.getMessage() + "\"}");
        }
    }
}

