package com.superapp.core.risk.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI riskMonitorServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Risk Monitor Service API")
                        .description("Risk monitoring and fraud detection service for Super App Ecosystem")
                        .version("v1.0")
                        .license(new License()
                                .name("Proprietary")
                                .url("https://superapp.com")));
    }
}




