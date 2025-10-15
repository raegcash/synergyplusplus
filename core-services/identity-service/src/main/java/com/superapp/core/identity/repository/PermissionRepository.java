package com.superapp.core.identity.repository;

import com.superapp.core.identity.domain.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Permission Repository
 */
@Repository
public interface PermissionRepository extends JpaRepository<Permission, UUID> {

    Optional<Permission> findByName(String name);

    List<Permission> findByResource(String resource);

    List<Permission> findByResourceAndAction(String resource, String action);

    List<Permission> findByIsActive(Boolean isActive);

    boolean existsByName(String name);
}




