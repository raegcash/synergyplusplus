package com.superapp.bff.client.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175"})
public class AuthController {

    private final RestTemplate restTemplate;
    
    @Value("${services.identity:http://localhost:8081}")
    private String identityUrl;

    public AuthController() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Login endpoint - proxies to Identity Service
     * Authenticates users against Identity Service
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, Object> credentials) {
        try {
            // Route to Identity Service for authentication
            String url = identityUrl + "/api/v1/auth/login";
            
            // Transform username to email if needed (for backward compatibility)
            if (credentials.containsKey("username") && !credentials.containsKey("email")) {
                Object username = credentials.get("username");
                credentials.put("email", username);
                credentials.remove("username");
            }
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(credentials, headers);
            
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
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Register endpoint - proxies to Identity Service
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, Object> userData) {
        try {
            String url = identityUrl + "/api/v1/auth/register";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(userData, headers);
            
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
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Logout endpoint
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader(value = "Authorization", required = false) String token) {
        // For now, just return success
        // In a real app, you'd invalidate the token on the backend
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    /**
     * Verify token endpoint
     */
    @GetMapping("/verify")
    public ResponseEntity<?> verifyToken(@RequestHeader("Authorization") String token) {
        try {
            String url = identityUrl + "/api/v1/auth/verify";
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", token);
            
            HttpEntity<Void> request = new HttpEntity<>(headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, request, Map.class);
            
            return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
        } catch (HttpClientErrorException e) {
            return ResponseEntity.status(e.getStatusCode()).body(Map.of(
                "error", e.getStatusText(),
                "valid", false
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "Internal Server Error",
                "valid", false
            ));
        }
    }
}

