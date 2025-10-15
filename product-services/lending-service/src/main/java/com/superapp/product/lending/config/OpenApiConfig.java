package com.superapp.product.lending.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI lendingServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Lending Service API")
                        .description("Loan origination and credit scoring service for Super App Ecosystem")
                        .version("v1.0")
                        .license(new License()
                                .name("Proprietary")
                                .url("https://superapp.com")));
    }
}




