package com.superapp.marketplace.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "features")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Feature extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_feature_id")
    private Feature parentFeature;

    // Feature Details
    @Column(nullable = false)
    private String name;

    @Column(nullable = false, length = 100)
    private String code;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "feature_type", length = 50)
    private String featureType;

    // Toggles
    private Boolean enabled = true;

    @Column(name = "maintenance_mode")
    private Boolean maintenanceMode = false;

    @Column(name = "whitelist_mode")
    private Boolean whitelistMode = false;

    // Rollout
    @Column(name = "rollout_percentage")
    private Integer rolloutPercentage = 100;

    // Relationships
    @OneToMany(mappedBy = "parentFeature", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<Feature> subFeatures = new HashSet<>();
}



