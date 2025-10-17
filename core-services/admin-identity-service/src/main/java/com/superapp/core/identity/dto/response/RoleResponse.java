package com.superapp.core.identity.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;
import java.util.UUID;

/**
 * Response DTO for role information
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleResponse {

    private UUID id;
    private String name;
    private String description;
    private String tenantId;
    private Set<PermissionResponse> permissions;
    private Boolean isActive;
}




