package com.superapp.core.identity.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI Configuration
 * Configures Swagger/OpenAPI documentation
 */
@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "Identity Service API",
                version = "1.0",
                description = "Identity and Authentication Service for Super App Ecosystem",
                contact = @Contact(name = "Super App Team", email = "support@superapp.com")
        ),
        servers = {
                @Server(url = "http://localhost:8081", description = "Local"),
                @Server(url = "https://api.superapp.com", description = "Production")
        }
)
@SecurityScheme(
        name = "bearer-jwt",
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT",
        in = SecuritySchemeIn.HEADER
)
public class OpenApiConfig {
}




