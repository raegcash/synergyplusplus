package com.superapp.core.identity.controller;

import com.superapp.core.identity.dto.request.UpdateUserRequest;
import com.superapp.core.identity.dto.response.UserResponse;
import com.superapp.core.identity.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * User Controller
 * Handles user management operations
 */
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User Management API")
@SecurityRequirement(name = "bearer-jwt")
public class UserController {

    private final UserService userService;

    /**
     * Get user by ID
     */
    @GetMapping("/{userId}")
    @Operation(summary = "Get user by ID")
    @PreAuthorize("hasAuthority('users:read')")
    public ResponseEntity<UserResponse> getUserById(@PathVariable UUID userId) {
        UserResponse response = userService.getUserById(userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Get all users
     */
    @GetMapping
    @Operation(summary = "Get all users")
    @PreAuthorize("hasAuthority('users:read')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<UserResponse> response = userService.getAllUsers();
        return ResponseEntity.ok(response);
    }

    /**
     * Get users by tenant
     */
    @GetMapping("/tenant/{tenantId}")
    @Operation(summary = "Get users by tenant")
    @PreAuthorize("hasAuthority('users:read')")
    public ResponseEntity<List<UserResponse>> getUsersByTenant(@PathVariable String tenantId) {
        List<UserResponse> response = userService.getUsersByTenant(tenantId);
        return ResponseEntity.ok(response);
    }

    /**
     * Update user
     */
    @PutMapping("/{userId}")
    @Operation(summary = "Update user")
    @PreAuthorize("hasAuthority('users:update')")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable UUID userId,
            @Valid @RequestBody UpdateUserRequest request) {
        UserResponse response = userService.updateUser(userId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Delete user
     */
    @DeleteMapping("/{userId}")
    @Operation(summary = "Delete user")
    @PreAuthorize("hasAuthority('users:delete')")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID userId) {
        userService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Count users by tenant
     */
    @GetMapping("/tenant/{tenantId}/count")
    @Operation(summary = "Count users by tenant")
    @PreAuthorize("hasAuthority('users:read')")
    public ResponseEntity<Long> countUsersByTenant(@PathVariable String tenantId) {
        long count = userService.countUsersByTenant(tenantId);
        return ResponseEntity.ok(count);
    }
}




