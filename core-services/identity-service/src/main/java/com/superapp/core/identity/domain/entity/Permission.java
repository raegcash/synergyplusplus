package com.superapp.core.identity.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.UUID;

/**
 * Permission Entity - Granular access control
 */
@Entity
@Table(name = "permissions", indexes = {
    @Index(name = "idx_permission_name", columnList = "name"),
    @Index(name = "idx_permission_resource", columnList = "resource")
})
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Permission extends AuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column
    private String description;

    /**
     * Resource this permission applies to
     * e.g., "users", "products", "transactions"
     */
    @Column(nullable = false)
    private String resource;

    /**
     * Action allowed
     * e.g., "read", "create", "update", "delete"
     */
    @Column(nullable = false)
    private String action;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    // Helper method
    public String getFullPermission() {
        return resource + ":" + action;
    }
}




