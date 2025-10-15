package com.superapp.core.identity.service;

import com.superapp.core.identity.domain.entity.Role;
import com.superapp.core.identity.domain.entity.User;
import com.superapp.core.identity.domain.enums.UserStatus;
import com.superapp.core.identity.domain.exception.BadRequestException;
import com.superapp.core.identity.domain.exception.UnauthorizedException;
import com.superapp.core.identity.dto.mapper.UserMapper;
import com.superapp.core.identity.dto.request.LoginRequest;
import com.superapp.core.identity.dto.request.RegisterUserRequest;
import com.superapp.core.identity.dto.response.AuthResponse;
import com.superapp.core.identity.dto.response.UserResponse;
import com.superapp.core.identity.repository.RoleRepository;
import com.superapp.core.identity.repository.UserRepository;
import com.superapp.core.identity.security.JwtTokenProvider;
import com.superapp.core.identity.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Authentication Service
 * Handles user registration and login
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserMapper userMapper;

    /**
     * Register a new user
     */
    @Transactional
    public UserResponse registerUser(RegisterUserRequest request) {
        log.info("Registering new user: {}", request.getEmail());

        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already in use");
        }

        // Create user entity
        User user = userMapper.toEntity(request);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setStatus(UserStatus.ACTIVE);

        // Assign default role
        Role defaultRole = roleRepository.findByName("USER")
                .orElseThrow(() -> new BadRequestException("Default role not found"));
        Set<Role> roles = new HashSet<>();
        roles.add(defaultRole);
        user.setRoles(roles);

        // Save user
        User savedUser = userRepository.save(user);
        log.info("User registered successfully: {}", savedUser.getEmail());

        return userMapper.toResponse(savedUser);
    }

    /**
     * Authenticate user and generate JWT tokens
     */
    @Transactional
    public AuthResponse login(LoginRequest request) {
        log.info("Authenticating user: {}", request.getEmail());

        // Authenticate
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Get user principal
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        // Verify tenant if provided
        if (request.getTenantId() != null && !request.getTenantId().equals(userPrincipal.getTenantId())) {
            throw new UnauthorizedException("Invalid tenant");
        }

        // Generate tokens
        String accessToken = jwtTokenProvider.generateAccessToken(authentication);
        String refreshToken = jwtTokenProvider.generateRefreshToken(authentication);

        // Update last login
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new UnauthorizedException("User not found"));
        user.setLastLoginAt(LocalDateTime.now());
        user.setFailedLoginAttempts(0);
        user.setAccountLockedUntil(null);
        userRepository.save(user);

        log.info("User authenticated successfully: {}", request.getEmail());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(86400000L)  // 24 hours
                .user(userMapper.toResponse(user))
                .build();
    }

    /**
     * Get current authenticated user
     */
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        return userMapper.toResponse(user);
    }
}




