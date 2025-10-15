package com.superapp.marketplace.domain.repository;

import com.superapp.marketplace.domain.entity.Feature;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FeatureRepository extends JpaRepository<Feature, UUID> {

    List<Feature> findByProductId(UUID productId);

    @Query("SELECT f FROM Feature f WHERE f.product.id = :productId AND f.parentFeature IS NULL")
    List<Feature> findRootFeaturesByProductId(UUID productId);

    List<Feature> findByParentFeatureId(UUID parentFeatureId);

    Optional<Feature> findByProductIdAndCode(UUID productId, String code);

    @Query("SELECT COUNT(f) FROM Feature f WHERE f.product.id = :productId")
    Long countByProductId(UUID productId);

    @Query("SELECT COUNT(f) FROM Feature f WHERE f.product.id = :productId AND f.enabled = true")
    Long countEnabledByProductId(UUID productId);
}



