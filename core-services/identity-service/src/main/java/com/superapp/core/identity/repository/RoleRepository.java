package com.superapp.core.identity.repository;

import com.superapp.core.identity.domain.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Role Repository
 */
@Repository
public interface RoleRepository extends JpaRepository<Role, UUID> {

    Optional<Role> findByName(String name);

    Optional<Role> findByNameAndTenantId(String name, String tenantId);

    List<Role> findByTenantId(String tenantId);

    List<Role> findByTenantIdIsNull();  // Global roles

    List<Role> findByIsActive(Boolean isActive);

    boolean existsByName(String name);
}




