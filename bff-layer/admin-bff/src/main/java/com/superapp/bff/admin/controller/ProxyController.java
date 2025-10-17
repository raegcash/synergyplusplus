package com.superapp.bff.admin.controller;

import com.superapp.bff.admin.dto.response.ApiResponse;
import com.superapp.bff.admin.exception.ServiceUnavailableException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Collections;
import java.util.Enumeration;

/**
 * Proxy controller that forwards requests to the Marketplace API
 * This provides a temporary bridge while we build out proper BFF services
 * 
 * TODO: Replace with dedicated controllers for Products, Partners, Assets
 */
@Slf4j
@RestController
@RequestMapping("/api/v1")
public class ProxyController {
    
    private final RestTemplate restTemplate;
    private final String marketplaceUrl;
    
    public ProxyController(
            RestTemplate restTemplate,
            @Value("${services.marketplace:http://localhost:8085/api/marketplace}") String marketplaceUrl) {
        this.restTemplate = restTemplate;
        this.marketplaceUrl = marketplaceUrl;
    }
    
    /**
     * Forward all requests to Marketplace API
     * Preserves HTTP method, headers, and body
     */
    @RequestMapping(value = "/**", method = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.PATCH})
    public ResponseEntity<?> proxyRequest(
            HttpServletRequest request,
            @RequestBody(required = false) String body) {
        
        String path = request.getRequestURI().replace("/api/v1", "");
        String queryString = request.getQueryString();
        String fullPath = queryString != null ? path + "?" + queryString : path;
        String targetUrl = marketplaceUrl + fullPath;
        
        log.info("Proxying {} {} to {}", request.getMethod(), fullPath, targetUrl);
        
        try {
            // Copy headers from request
            HttpHeaders headers = new HttpHeaders();
            Enumeration<String> headerNames = request.getHeaderNames();
            while (headerNames.hasMoreElements()) {
                String headerName = headerNames.nextElement();
                // Skip host header to avoid conflicts
                if (!"host".equalsIgnoreCase(headerName)) {
                    headers.put(headerName, Collections.list(request.getHeaders(headerName)));
                }
            }
            
            HttpEntity<String> entity = new HttpEntity<>(body, headers);
            HttpMethod method = HttpMethod.valueOf(request.getMethod());
            
            ResponseEntity<String> response = restTemplate.exchange(
                    targetUrl,
                    method,
                    entity,
                    String.class
            );
            
            log.info("Proxy response: {} {}", response.getStatusCode(), fullPath);
            return ResponseEntity.status(response.getStatusCode())
                    .headers(response.getHeaders())
                    .body(response.getBody());
            
        } catch (Exception e) {
            log.error("Error proxying request to {}: {}", targetUrl, e.getMessage());
            throw new ServiceUnavailableException("Marketplace API", e);
        }
    }
}

