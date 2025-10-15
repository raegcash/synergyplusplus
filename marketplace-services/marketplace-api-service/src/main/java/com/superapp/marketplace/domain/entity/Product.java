package com.superapp.marketplace.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product extends BaseEntity {

    @Column(unique = true, nullable = false, length = 50)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(name = "product_type", nullable = false, length = 50)
    private String productType;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 50)
    private String status = "PENDING_APPROVAL";

    // Financial
    @Column(name = "min_investment", nullable = false, precision = 18, scale = 2)
    private BigDecimal minInvestment;

    @Column(name = "max_investment", nullable = false, precision = 18, scale = 2)
    private BigDecimal maxInvestment;

    @Column(length = 3)
    private String currency = "PHP";

    // Features & Config
    @Column(name = "maintenance_mode")
    private Boolean maintenanceMode = false;

    @Column(name = "whitelist_mode")
    private Boolean whitelistMode = false;

    @Column(name = "features_count")
    private Integer featuresCount = 0;

    @Column(name = "enabled_features_count")
    private Integer enabledFeaturesCount = 0;

    @Column(name = "assets_count")
    private Integer assetsCount = 0;

    // Metadata
    @Column(name = "terms_and_conditions", columnDefinition = "TEXT")
    private String termsAndConditions;

    @Column(name = "submitted_by")
    private String submittedBy;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    // Relationships
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<ProductPartner> productPartners = new HashSet<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<Asset> assets = new HashSet<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<Feature> features = new HashSet<>();
}



