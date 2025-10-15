package com.superapp.marketplace.domain.controller;

import com.superapp.marketplace.domain.entity.Approval;
import com.superapp.marketplace.domain.entity.Asset;
import com.superapp.marketplace.domain.entity.Partner;
import com.superapp.marketplace.domain.entity.Product;
import com.superapp.marketplace.domain.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/approvals")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class ApprovalController {

    private final ApprovalRepository approvalRepository;
    private final ProductRepository productRepository;
    private final PartnerRepository partnerRepository;
    private final AssetRepository assetRepository;

    @GetMapping
    public ResponseEntity<List<Approval>> getAllApprovals() {
        log.info("Getting all approvals");
        return ResponseEntity.ok(approvalRepository.findAll());
    }

    @GetMapping("/pending")
    public ResponseEntity<List<Approval>> getPendingApprovals() {
        log.info("Getting pending approvals");
        return ResponseEntity.ok(approvalRepository.findByStatus("PENDING"));
    }

    @GetMapping("/type/{itemType}")
    public ResponseEntity<List<Approval>> getApprovalsByType(@PathVariable String itemType) {
        log.info("Getting approvals by type: {}", itemType);
        return ResponseEntity.ok(approvalRepository.findByItemType(itemType));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Approval> getApprovalById(@PathVariable UUID id) {
        log.info("Getting approval by id: {}", id);
        return approvalRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<Approval> approveItem(@PathVariable UUID id) {
        log.info("Approving item with approval id: {}", id);
        
        return approvalRepository.findById(id)
            .map(approval -> {
                approval.setStatus("APPROVED");
                approval.setApprovedBy("admin@superapp.com");
                approval.setApprovedAt(LocalDateTime.now());
                
                // Update the actual item
                switch (approval.getItemType()) {
                    case "PRODUCT" -> productRepository.findById(approval.getItemId())
                        .ifPresent(product -> {
                            product.setStatus("APPROVED");
                            product.setApprovedAt(LocalDateTime.now());
                            productRepository.save(product);
                        });
                    case "PARTNER" -> partnerRepository.findById(approval.getItemId())
                        .ifPresent(partner -> {
                            partner.setStatus("ACTIVE");
                            partner.setApprovedAt(LocalDateTime.now());
                            partnerRepository.save(partner);
                        });
                    case "ASSET" -> assetRepository.findById(approval.getItemId())
                        .ifPresent(asset -> {
                            asset.setStatus("ACTIVE");
                            asset.setApprovedAt(LocalDateTime.now());
                            assetRepository.save(asset);
                        });
                }
                
                return ResponseEntity.ok(approvalRepository.save(approval));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<Approval> rejectItem(@PathVariable UUID id, @RequestBody(required = false) String reason) {
        log.info("Rejecting item with approval id: {}", id);
        
        return approvalRepository.findById(id)
            .map(approval -> {
                approval.setStatus("REJECTED");
                approval.setRejectedBy("admin@superapp.com");
                approval.setRejectedAt(LocalDateTime.now());
                approval.setRejectionReason(reason != null ? reason : "Not meeting requirements");
                
                // Update the actual item
                switch (approval.getItemType()) {
                    case "PRODUCT" -> productRepository.findById(approval.getItemId())
                        .ifPresent(product -> {
                            product.setStatus("REJECTED");
                            productRepository.save(product);
                        });
                    case "PARTNER" -> partnerRepository.findById(approval.getItemId())
                        .ifPresent(partner -> {
                            partner.setStatus("REJECTED");
                            partnerRepository.save(partner);
                        });
                    case "ASSET" -> assetRepository.findById(approval.getItemId())
                        .ifPresent(asset -> {
                            asset.setStatus("SUSPENDED");
                            assetRepository.save(asset);
                        });
                }
                
                return ResponseEntity.ok(approvalRepository.save(approval));
            })
            .orElse(ResponseEntity.notFound().build());
    }
}



