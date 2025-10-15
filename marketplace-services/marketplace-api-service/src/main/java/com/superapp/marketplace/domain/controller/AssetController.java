package com.superapp.marketplace.domain.controller;

import com.superapp.marketplace.domain.entity.Approval;
import com.superapp.marketplace.domain.entity.Asset;
import com.superapp.marketplace.domain.repository.ApprovalRepository;
import com.superapp.marketplace.domain.repository.AssetRepository;
import com.superapp.marketplace.domain.repository.PartnerRepository;
import com.superapp.marketplace.domain.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/assets")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class AssetController {

    private final AssetRepository assetRepository;
    private final ProductRepository productRepository;
    private final PartnerRepository partnerRepository;
    private final ApprovalRepository approvalRepository;

    @GetMapping
    public ResponseEntity<List<Asset>> getAllAssets() {
        log.info("Getting all assets");
        return ResponseEntity.ok(assetRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Asset> getAssetById(@PathVariable UUID id) {
        log.info("Getting asset by id: {}", id);
        return assetRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Asset>> getAssetsByStatus(@PathVariable String status) {
        log.info("Getting assets by status: {}", status);
        return ResponseEntity.ok(assetRepository.findByStatus(status));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Asset>> getAssetsByProduct(@PathVariable UUID productId) {
        log.info("Getting assets by product: {}", productId);
        return ResponseEntity.ok(assetRepository.findByProductId(productId));
    }

    @PostMapping
    public ResponseEntity<Asset> createAsset(@RequestBody Map<String, Object> request) {
        log.info("Creating asset");
        
        UUID productId = UUID.fromString((String) request.get("productId"));
        UUID partnerId = UUID.fromString((String) request.get("partnerId"));

        var product = productRepository.findById(productId).orElse(null);
        var partner = partnerRepository.findById(partnerId).orElse(null);

        if (product == null || partner == null) {
            return ResponseEntity.badRequest().build();
        }

        Asset asset = Asset.builder()
            .product(product)
            .partner(partner)
            .name((String) request.get("name"))
            .symbol((String) request.get("symbol"))
            .assetCode((String) request.get("assetCode"))
            .assetType((String) request.get("assetType"))
            .description((String) request.get("description"))
            .currentPrice(new BigDecimal(request.get("currentPrice").toString()))
            .priceCurrency((String) request.getOrDefault("priceCurrency", "PHP"))
            .minInvestment(new BigDecimal(request.get("minInvestment").toString()))
            .maxInvestment(new BigDecimal(request.get("maxInvestment").toString()))
            .riskLevel((String) request.get("riskLevel"))
            .status("PENDING_APPROVAL")
            .submittedBy((String) request.getOrDefault("submittedBy", "admin@superapp.com"))
            .submittedAt(LocalDateTime.now())
            .submissionSource((String) request.getOrDefault("submissionSource", "ADMIN_PORTAL"))
            .build();

        // UITF-specific fields
        if (request.containsKey("investmentAmount")) {
            asset.setInvestmentAmount(new BigDecimal(request.get("investmentAmount").toString()));
        }
        if (request.containsKey("indicativeUnits")) {
            asset.setIndicativeUnits(new BigDecimal(request.get("indicativeUnits").toString()));
        }
        if (request.containsKey("indicativeNavpu")) {
            asset.setIndicativeNavpu(new BigDecimal(request.get("indicativeNavpu").toString()));
        }
        if (request.containsKey("navAsOfDate")) {
            asset.setNavAsOfDate(LocalDate.parse(request.get("navAsOfDate").toString()));
        }
        if (request.containsKey("navPerUnit")) {
            asset.setNavPerUnit(new BigDecimal(request.get("navPerUnit").toString()));
        }

        if (assetRepository.existsByAssetCode(asset.getAssetCode())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        Asset savedAsset = assetRepository.save(asset);

        // Create approval entry
        Approval approval = Approval.builder()
            .itemType("ASSET")
            .itemId(savedAsset.getId())
            .status("PENDING")
            .submittedBy(savedAsset.getSubmittedBy())
            .submittedAt(LocalDateTime.now())
            .currentStep("Asset Registration")
            .nextStep("Admin Approval")
            .hierarchyLevel(1)
            .build();
        approvalRepository.save(approval);

        log.info("Asset created with ID: {}", savedAsset.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(savedAsset);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Asset> updateAsset(@PathVariable UUID id, @RequestBody Asset asset) {
        log.info("Updating asset: {}", id);
        return assetRepository.findById(id)
            .map(existing -> {
                existing.setName(asset.getName());
                existing.setDescription(asset.getDescription());
                existing.setSymbol(asset.getSymbol());
                existing.setAssetType(asset.getAssetType());
                existing.setCurrentPrice(asset.getCurrentPrice());
                existing.setMinInvestment(asset.getMinInvestment());
                existing.setMaxInvestment(asset.getMaxInvestment());
                existing.setRiskLevel(asset.getRiskLevel());
                existing.setHistoricalReturn(asset.getHistoricalReturn());
                existing.setYearToDateReturn(asset.getYearToDateReturn());
                
                // UITF fields
                if (asset.getInvestmentAmount() != null) {
                    existing.setInvestmentAmount(asset.getInvestmentAmount());
                }
                if (asset.getIndicativeUnits() != null) {
                    existing.setIndicativeUnits(asset.getIndicativeUnits());
                }
                if (asset.getIndicativeNavpu() != null) {
                    existing.setIndicativeNavpu(asset.getIndicativeNavpu());
                }
                if (asset.getNavAsOfDate() != null) {
                    existing.setNavAsOfDate(asset.getNavAsOfDate());
                }
                if (asset.getNavPerUnit() != null) {
                    existing.setNavPerUnit(asset.getNavPerUnit());
                }
                
                if (asset.getStatus() != null) {
                    existing.setStatus(asset.getStatus());
                }
                
                return ResponseEntity.ok(assetRepository.save(existing));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<Asset> approveAsset(@PathVariable UUID id) {
        log.info("Approving asset: {}", id);
        return assetRepository.findById(id)
            .map(asset -> {
                asset.setStatus("ACTIVE");
                asset.setApprovedAt(LocalDateTime.now());
                Asset updated = assetRepository.save(asset);

                // Update approval
                approvalRepository.findByItemIdAndItemType(id, "ASSET")
                    .ifPresent(approval -> {
                        approval.setStatus("APPROVED");
                        approval.setApprovedBy("admin@superapp.com");
                        approval.setApprovedAt(LocalDateTime.now());
                        approvalRepository.save(approval);
                    });

                return ResponseEntity.ok(updated);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<Asset> rejectAsset(@PathVariable UUID id, @RequestBody(required = false) String reason) {
        log.info("Rejecting asset: {}", id);
        return assetRepository.findById(id)
            .map(asset -> {
                asset.setStatus("SUSPENDED");
                Asset updated = assetRepository.save(asset);

                // Update approval
                approvalRepository.findByItemIdAndItemType(id, "ASSET")
                    .ifPresent(approval -> {
                        approval.setStatus("REJECTED");
                        approval.setRejectedBy("admin@superapp.com");
                        approval.setRejectedAt(LocalDateTime.now());
                        approval.setRejectionReason(reason != null ? reason : "Not meeting requirements");
                        approvalRepository.save(approval);
                    });

                return ResponseEntity.ok(updated);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAsset(@PathVariable UUID id) {
        log.info("Deleting asset: {}", id);
        if (assetRepository.existsById(id)) {
            assetRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}



