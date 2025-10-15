package com.superapp.marketplace.domain.controller;

import com.superapp.marketplace.domain.entity.Approval;
import com.superapp.marketplace.domain.entity.Partner;
import com.superapp.marketplace.domain.entity.Product;
import com.superapp.marketplace.domain.entity.ProductPartner;
import com.superapp.marketplace.domain.repository.ApprovalRepository;
import com.superapp.marketplace.domain.repository.PartnerRepository;
import com.superapp.marketplace.domain.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/partners")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class PartnerController {

    private final PartnerRepository partnerRepository;
    private final ProductRepository productRepository;
    private final ApprovalRepository approvalRepository;

    @GetMapping
    public ResponseEntity<List<Partner>> getAllPartners() {
        log.info("Getting all partners");
        return ResponseEntity.ok(partnerRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Partner> getPartnerById(@PathVariable UUID id) {
        log.info("Getting partner by id: {}", id);
        return partnerRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Partner>> getPartnersByStatus(@PathVariable String status) {
        log.info("Getting partners by status: {}", status);
        return ResponseEntity.ok(partnerRepository.findByStatus(status));
    }

    @PostMapping
    public ResponseEntity<Partner> createPartner(@RequestBody Map<String, Object> request) {
        log.info("Creating partner");
        
        Partner partner = Partner.builder()
            .code((String) request.get("code"))
            .name((String) request.get("name"))
            .partnerType((String) request.get("partnerType"))
            .description((String) request.get("description"))
            .contactPerson((String) request.get("contactPerson"))
            .contactEmail((String) request.get("contactEmail"))
            .contactPhone((String) request.get("contactPhone"))
            .website((String) request.get("website"))
            .registrationNumber((String) request.get("registrationNumber"))
            .address((String) request.get("address"))
            .apiEndpoint((String) request.get("apiEndpoint"))
            .sftpHost((String) request.get("sftpHost"))
            .status("PENDING_APPROVAL")
            .submittedBy("admin@superapp.com")
            .submittedAt(LocalDateTime.now())
            .build();

        if (partnerRepository.existsByCode(partner.getCode())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        Partner savedPartner = partnerRepository.save(partner);

        // Map to products if provided
        @SuppressWarnings("unchecked")
        List<String> productIds = (List<String>) request.get("products");
        if (productIds != null && !productIds.isEmpty()) {
            for (String productIdStr : productIds) {
                UUID productId = UUID.fromString(productIdStr);
                productRepository.findById(productId).ifPresent(product -> {
                    ProductPartner pp = ProductPartner.builder()
                        .product(product)
                        .partner(savedPartner)
                        .status("ACTIVE")
                        .mappedAt(LocalDateTime.now())
                        .mappedBy("admin@superapp.com")
                        .build();
                    savedPartner.getProductPartners().add(pp);
                });
            }
            savedPartner = partnerRepository.save(savedPartner);
        }

        // Create approval entry
        Approval approval = Approval.builder()
            .itemType("PARTNER")
            .itemId(savedPartner.getId())
            .status("PENDING")
            .submittedBy(savedPartner.getSubmittedBy())
            .submittedAt(LocalDateTime.now())
            .currentStep("Partner Registration")
            .nextStep("Admin Approval")
            .hierarchyLevel(1)
            .build();
        approvalRepository.save(approval);

        log.info("Partner created with ID: {}", savedPartner.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(savedPartner);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Partner> updatePartner(@PathVariable UUID id, @RequestBody Partner partner) {
        log.info("Updating partner: {}", id);
        return partnerRepository.findById(id)
            .map(existing -> {
                existing.setName(partner.getName());
                existing.setDescription(partner.getDescription());
                existing.setPartnerType(partner.getPartnerType());
                existing.setContactPerson(partner.getContactPerson());
                existing.setContactEmail(partner.getContactEmail());
                existing.setContactPhone(partner.getContactPhone());
                existing.setWebsite(partner.getWebsite());
                existing.setRegistrationNumber(partner.getRegistrationNumber());
                existing.setAddress(partner.getAddress());
                existing.setApiEndpoint(partner.getApiEndpoint());
                existing.setSftpHost(partner.getSftpHost());
                
                if (partner.getStatus() != null) {
                    existing.setStatus(partner.getStatus());
                }
                
                return ResponseEntity.ok(partnerRepository.save(existing));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<Partner> approvePartner(@PathVariable UUID id) {
        log.info("Approving partner: {}", id);
        return partnerRepository.findById(id)
            .map(partner -> {
                partner.setStatus("ACTIVE");
                partner.setApprovedAt(LocalDateTime.now());
                
                // Update mapped products to include this partner
                partner.getProductPartners().forEach(pp -> {
                    Product product = pp.getProduct();
                    product.getProductPartners().add(pp);
                    productRepository.save(product);
                });
                
                Partner updated = partnerRepository.save(partner);

                // Update approval
                approvalRepository.findByItemIdAndItemType(id, "PARTNER")
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
    public ResponseEntity<Partner> rejectPartner(@PathVariable UUID id, @RequestBody(required = false) String reason) {
        log.info("Rejecting partner: {}", id);
        return partnerRepository.findById(id)
            .map(partner -> {
                partner.setStatus("REJECTED");
                Partner updated = partnerRepository.save(partner);

                // Update approval
                approvalRepository.findByItemIdAndItemType(id, "PARTNER")
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
    public ResponseEntity<Void> deletePartner(@PathVariable UUID id) {
        log.info("Deleting partner: {}", id);
        if (partnerRepository.existsById(id)) {
            partnerRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}



