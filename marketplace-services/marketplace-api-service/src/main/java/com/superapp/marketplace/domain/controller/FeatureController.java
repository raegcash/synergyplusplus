package com.superapp.marketplace.domain.controller;

import com.superapp.marketplace.domain.entity.Feature;
import com.superapp.marketplace.domain.repository.FeatureRepository;
import com.superapp.marketplace.domain.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/features")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class FeatureController {

    private final FeatureRepository featureRepository;
    private final ProductRepository productRepository;

    @GetMapping
    public ResponseEntity<List<Feature>> getAllFeatures() {
        log.info("Getting all features");
        return ResponseEntity.ok(featureRepository.findAll());
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Feature>> getFeaturesByProduct(@PathVariable UUID productId) {
        log.info("Getting features for product: {}", productId);
        return ResponseEntity.ok(featureRepository.findRootFeaturesByProductId(productId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Feature> getFeatureById(@PathVariable UUID id) {
        log.info("Getting feature by id: {}", id);
        return featureRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Feature> createFeature(@RequestBody Map<String, Object> request) {
        log.info("Creating feature");
        
        UUID productId = UUID.fromString((String) request.get("productId"));
        var product = productRepository.findById(productId).orElse(null);
        
        if (product == null) {
            return ResponseEntity.badRequest().build();
        }

        Feature feature = Feature.builder()
            .product(product)
            .name((String) request.get("name"))
            .code((String) request.get("code"))
            .description((String) request.get("description"))
            .featureType((String) request.getOrDefault("featureType", "FEATURE"))
            .enabled((Boolean) request.getOrDefault("enabled", true))
            .maintenanceMode((Boolean) request.getOrDefault("maintenanceMode", false))
            .whitelistMode((Boolean) request.getOrDefault("whitelistMode", false))
            .rolloutPercentage((Integer) request.getOrDefault("rolloutPercentage", 100))
            .build();

        Feature saved = featureRepository.save(feature);
        log.info("Feature created with ID: {}", saved.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Feature> updateFeature(@PathVariable UUID id, @RequestBody Feature feature) {
        log.info("Updating feature: {}", id);
        return featureRepository.findById(id)
            .map(existing -> {
                existing.setName(feature.getName());
                existing.setDescription(feature.getDescription());
                existing.setEnabled(feature.getEnabled());
                existing.setMaintenanceMode(feature.getMaintenanceMode());
                existing.setWhitelistMode(feature.getWhitelistMode());
                existing.setRolloutPercentage(feature.getRolloutPercentage());
                return ResponseEntity.ok(featureRepository.save(existing));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Feature> toggleFeature(@PathVariable UUID id, @RequestBody Map<String, Boolean> request) {
        log.info("Toggling feature: {}", id);
        return featureRepository.findById(id)
            .map(feature -> {
                if (request.containsKey("enabled")) {
                    feature.setEnabled(request.get("enabled"));
                }
                if (request.containsKey("maintenanceMode")) {
                    feature.setMaintenanceMode(request.get("maintenanceMode"));
                }
                if (request.containsKey("whitelistMode")) {
                    feature.setWhitelistMode(request.get("whitelistMode"));
                }
                return ResponseEntity.ok(featureRepository.save(feature));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFeature(@PathVariable UUID id) {
        log.info("Deleting feature: {}", id);
        if (featureRepository.existsById(id)) {
            featureRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}



