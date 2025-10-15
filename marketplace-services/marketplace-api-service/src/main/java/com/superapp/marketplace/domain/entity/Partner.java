package com.superapp.marketplace.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "partners")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Partner extends BaseEntity {

    @Column(unique = true, nullable = false, length = 50)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(name = "partner_type", nullable = false, length = 50)
    private String partnerType;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 50)
    private String status = "PENDING_APPROVAL";

    // Contact Info
    @Column(name = "contact_person")
    private String contactPerson;

    @Column(name = "contact_email")
    private String contactEmail;

    @Column(name = "contact_phone", length = 50)
    private String contactPhone;

    private String website;

    // Business Info
    @Column(name = "registration_number", length = 100)
    private String registrationNumber;

    @Column(name = "tax_id", length = 100)
    private String taxId;

    @Column(columnDefinition = "TEXT")
    private String address;

    // Integration
    @Column(name = "api_endpoint", length = 500)
    private String apiEndpoint;

    @Column(name = "api_key_encrypted", columnDefinition = "TEXT")
    private String apiKeyEncrypted;

    @Column(name = "sftp_host")
    private String sftpHost;

    @Column(name = "sftp_username")
    private String sftpUsername;

    // Metadata
    @Column(name = "submitted_by")
    private String submittedBy;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    // Relationships
    @OneToMany(mappedBy = "partner", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<ProductPartner> productPartners = new HashSet<>();

    @OneToMany(mappedBy = "partner", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<Asset> assets = new HashSet<>();
}



