package com.superapp.marketplace.domain.controller;

import com.superapp.marketplace.domain.entity.Approval;
import com.superapp.marketplace.domain.entity.Product;
import com.superapp.marketplace.domain.repository.ApprovalRepository;
import com.superapp.marketplace.domain.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class ProductController {

    private final ProductRepository productRepository;
    private final ApprovalRepository approvalRepository;

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        log.info("Getting all products");
        return ResponseEntity.ok(productRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable UUID id) {
        log.info("Getting product by id: {}", id);
        return productRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Product>> getProductsByStatus(@PathVariable String status) {
        log.info("Getting products by status: {}", status);
        return ResponseEntity.ok(productRepository.findByStatusOrderByCreatedAtDesc(status));
    }

    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        log.info("Creating product: {}", product.getName());
        
        if (productRepository.existsByCode(product.getCode())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        product.setStatus("PENDING_APPROVAL");
        product.setSubmittedAt(LocalDateTime.now());
        product.setSubmittedBy("admin@superapp.com"); // TODO: Get from security context
        
        Product savedProduct = productRepository.save(product);

        // Create approval entry
        Approval approval = Approval.builder()
            .itemType("PRODUCT")
            .itemId(savedProduct.getId())
            .status("PENDING")
            .submittedBy(savedProduct.getSubmittedBy())
            .submittedAt(LocalDateTime.now())
            .currentStep("Product Creation")
            .nextStep("Admin Approval")
            .hierarchyLevel(1)
            .build();
        approvalRepository.save(approval);

        log.info("Product created with ID: {}", savedProduct.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(savedProduct);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable UUID id, @RequestBody Product product) {
        log.info("Updating product: {}", id);
        return productRepository.findById(id)
            .map(existing -> {
                // Update fields
                existing.setName(product.getName());
                existing.setDescription(product.getDescription());
                existing.setProductType(product.getProductType());
                existing.setMinInvestment(product.getMinInvestment());
                existing.setMaxInvestment(product.getMaxInvestment());
                existing.setCurrency(product.getCurrency());
                existing.setTermsAndConditions(product.getTermsAndConditions());
                
                // Update feature config if provided
                if (product.getMaintenanceMode() != null) {
                    existing.setMaintenanceMode(product.getMaintenanceMode());
                }
                if (product.getWhitelistMode() != null) {
                    existing.setWhitelistMode(product.getWhitelistMode());
                }
                if (product.getStatus() != null) {
                    existing.setStatus(product.getStatus());
                }
                
                return ResponseEntity.ok(productRepository.save(existing));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<Product> approveProduct(@PathVariable UUID id) {
        log.info("Approving product: {}", id);
        return productRepository.findById(id)
            .map(product -> {
                product.setStatus("APPROVED");
                product.setApprovedAt(LocalDateTime.now());
                Product updated = productRepository.save(product);

                // Update approval
                approvalRepository.findByItemIdAndItemType(id, "PRODUCT")
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
    public ResponseEntity<Product> rejectProduct(@PathVariable UUID id, @RequestBody(required = false) String reason) {
        log.info("Rejecting product: {}", id);
        return productRepository.findById(id)
            .map(product -> {
                product.setStatus("REJECTED");
                Product updated = productRepository.save(product);

                // Update approval
                approvalRepository.findByItemIdAndItemType(id, "PRODUCT")
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
    public ResponseEntity<Void> deleteProduct(@PathVariable UUID id) {
        log.info("Deleting product: {}", id);
        if (productRepository.existsById(id)) {
            productRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}



