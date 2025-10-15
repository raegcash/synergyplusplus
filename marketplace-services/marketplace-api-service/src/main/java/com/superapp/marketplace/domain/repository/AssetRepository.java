package com.superapp.marketplace.domain.repository;

import com.superapp.marketplace.domain.entity.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AssetRepository extends JpaRepository<Asset, UUID> {

    Optional<Asset> findByAssetCode(String assetCode);

    List<Asset> findByStatus(String status);

    List<Asset> findByProductId(UUID productId);

    List<Asset> findByPartnerId(UUID partnerId);

    @Query("SELECT a FROM Asset a WHERE a.product.id = :productId AND a.partner.id = :partnerId")
    List<Asset> findByProductIdAndPartnerId(UUID productId, UUID partnerId);

    boolean existsByAssetCode(String assetCode);
}



