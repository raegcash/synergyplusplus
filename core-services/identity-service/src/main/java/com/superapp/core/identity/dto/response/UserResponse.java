package com.superapp.core.identity.dto.response;

import com.superapp.core.identity.domain.enums.KycStatus;
import com.superapp.core.identity.domain.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

/**
 * Response DTO for user information
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private UUID id;
    private String email;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String tenantId;
    private String externalId;
    private UserStatus status;
    private KycStatus kycStatus;
    private LocalDateTime kycCompletedAt;
    private LocalDateTime lastLoginAt;
    private Set<RoleResponse> roles;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}




