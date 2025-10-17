package com.superapp.bff.admin.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import org.springframework.boot.web.client.RestTemplateBuilder;

import java.time.Duration;

/**
 * Configuration for RestTemplate and service URLs
 */
@Configuration
@ConfigurationProperties(prefix = "services")
public class RestClientConfig {
    
    private String identity;
    private String partner;
    private String catalog;
    private String risk;
    
    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder
                .setConnectTimeout(Duration.ofSeconds(5))
                .setReadTimeout(Duration.ofSeconds(10))
                .build();
    }
    
    // Getters and setters
    public String getIdentity() {
        return identity;
    }
    
    public void setIdentity(String identity) {
        this.identity = identity;
    }
    
    public String getPartner() {
        return partner;
    }
    
    public void setPartner(String partner) {
        this.partner = partner;
    }
    
    public String getCatalog() {
        return catalog;
    }
    
    public void setCatalog(String catalog) {
        this.catalog = catalog;
    }
    
    public String getRisk() {
        return risk;
    }
    
    public void setRisk(String risk) {
        this.risk = risk;
    }
}

