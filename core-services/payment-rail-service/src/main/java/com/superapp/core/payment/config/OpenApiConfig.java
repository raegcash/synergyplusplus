package com.superapp.core.payment.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI/Swagger configuration
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI paymentRailServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Payment Rail Service API")
                        .description("Payment processing and gateway service for Super App Ecosystem")
                        .version("v1.0")
                        .license(new License()
                                .name("Proprietary")
                                .url("https://superapp.com")));
    }
}




