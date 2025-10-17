package com.superapp.core.identity.repository;

import com.superapp.core.identity.domain.entity.User;
import com.superapp.core.identity.domain.enums.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * User Repository
 */
@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    Optional<User> findByEmailAndTenantId(String email, String tenantId);

    Optional<User> findByExternalId(String externalId);

    List<User> findByTenantId(String tenantId);

    List<User> findByStatus(UserStatus status);

    List<User> findByTenantIdAndStatus(String tenantId, UserStatus status);

    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = :roleName")
    List<User> findByRoleName(String roleName);

    @Query("SELECT u FROM User u WHERE u.tenantId = :tenantId AND u.kycStatus = 'APPROVED'")
    List<User> findKycApprovedUsersByTenant(String tenantId);

    long countByTenantId(String tenantId);
}




