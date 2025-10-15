package com.superapp.core.ledger.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI Configuration
 */
@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "Ledger Service API",
                version = "1.0",
                description = "Double-entry ledger and transaction management service",
                contact = @Contact(name = "Super App Team", email = "support@superapp.com")
        ),
        servers = {
                @Server(url = "http://localhost:8082", description = "Local"),
                @Server(url = "https://api.superapp.com", description = "Production")
        }
)
public class OpenApiConfig {
}




