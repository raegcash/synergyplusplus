package com.superapp.core.identity.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Response DTO for permission information
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PermissionResponse {

    private UUID id;
    private String name;
    private String description;
    private String resource;
    private String action;
    private Boolean isActive;
}




