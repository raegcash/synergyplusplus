package com.superapp.core.identity.domain.entity;

import com.superapp.core.identity.domain.enums.KycStatus;
import com.superapp.core.identity.domain.enums.UserStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

/**
 * User Entity - Multi-tenant user management
 */
@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_email", columnList = "email"),
    @Index(name = "idx_tenant_id", columnList = "tenantId"),
    @Index(name = "idx_external_id", columnList = "externalId")
})
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class User extends AuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column
    private String phoneNumber;

    /**
     * Tenant/Partner ID - enables multi-tenancy
     * e.g., "partner-bank-1", "fintech-startup-2"
     */
    @Column(nullable = false)
    private String tenantId;

    /**
     * External ID from partner system (for identity federation)
     */
    @Column
    private String externalId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private UserStatus status = UserStatus.ACTIVE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private KycStatus kycStatus = KycStatus.NOT_STARTED;

    @Column
    private LocalDateTime kycCompletedAt;

    @Column
    private LocalDateTime lastLoginAt;

    @Column
    private Integer failedLoginAttempts = 0;

    @Column
    private LocalDateTime accountLockedUntil;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    @Builder.Default
    private Set<Role> roles = new HashSet<>();

    /**
     * Metadata for extensibility (stored as JSON)
     */
    @Column(columnDefinition = "jsonb")
    private String metadata;

    // Helper methods
    public boolean isAccountLocked() {
        return accountLockedUntil != null && accountLockedUntil.isAfter(LocalDateTime.now());
    }

    public boolean isKycCompleted() {
        return kycStatus == KycStatus.APPROVED;
    }

    public String getFullName() {
        return firstName + " " + lastName;
    }
}




