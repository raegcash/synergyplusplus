package com.superapp.core.identity.service;

import com.superapp.core.identity.domain.entity.User;
import com.superapp.core.identity.domain.exception.ResourceNotFoundException;
import com.superapp.core.identity.dto.mapper.UserMapper;
import com.superapp.core.identity.dto.request.UpdateUserRequest;
import com.superapp.core.identity.dto.response.UserResponse;
import com.superapp.core.identity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * User Service
 * Handles user management operations
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    /**
     * Get user by ID
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "users", key = "#userId")
    public UserResponse getUserById(UUID userId) {
        log.debug("Fetching user by ID: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        return userMapper.toResponse(user);
    }

    /**
     * Get user by email
     */
    @Transactional(readOnly = true)
    public UserResponse getUserByEmail(String email) {
        log.debug("Fetching user by email: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        return userMapper.toResponse(user);
    }

    /**
     * Get all users by tenant
     */
    @Transactional(readOnly = true)
    public List<UserResponse> getUsersByTenant(String tenantId) {
        log.debug("Fetching users for tenant: {}", tenantId);

        return userRepository.findByTenantId(tenantId).stream()
                .map(userMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Update user
     */
    @Transactional
    @CacheEvict(value = "users", key = "#userId")
    public UserResponse updateUser(UUID userId, UpdateUserRequest request) {
        log.info("Updating user: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        userMapper.updateEntityFromDto(request, user);
        User updatedUser = userRepository.save(user);

        log.info("User updated successfully: {}", userId);
        return userMapper.toResponse(updatedUser);
    }

    /**
     * Delete user (soft delete by setting status to DELETED)
     */
    @Transactional
    @CacheEvict(value = "users", key = "#userId")
    public void deleteUser(UUID userId) {
        log.info("Deleting user: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        user.setStatus(com.superapp.core.identity.domain.enums.UserStatus.DELETED);
        userRepository.save(user);

        log.info("User deleted successfully: {}", userId);
    }

    /**
     * Get all users
     */
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        log.debug("Fetching all users");

        return userRepository.findAll().stream()
                .map(userMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Count users by tenant
     */
    @Transactional(readOnly = true)
    public long countUsersByTenant(String tenantId) {
        return userRepository.countByTenantId(tenantId);
    }
}




