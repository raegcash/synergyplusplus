package com.superapp.core.identity.service;

import com.superapp.core.identity.domain.entity.User;
import com.superapp.core.identity.domain.exception.ResourceNotFoundException;
import com.superapp.core.identity.repository.UserRepository;
import com.superapp.core.identity.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Custom UserDetailsService implementation
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Check if username is UUID (for JWT token validation)
        try {
            UUID userId = UUID.fromString(username);
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + username));
            return UserPrincipal.create(user);
        } catch (IllegalArgumentException e) {
            // Username is email
            User user = userRepository.findByEmail(username)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + username));
            return UserPrincipal.create(user);
        }
    }
}




