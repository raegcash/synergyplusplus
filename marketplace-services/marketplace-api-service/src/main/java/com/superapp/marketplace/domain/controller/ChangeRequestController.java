package com.superapp.marketplace.domain.controller;

import com.superapp.marketplace.domain.entity.ChangeRequest;
import com.superapp.marketplace.domain.repository.ChangeRequestRepository;
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
@RequestMapping("/change-requests")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class ChangeRequestController {

    private final ChangeRequestRepository changeRequestRepository;
    private final ProductRepository productRepository;

    @GetMapping
    public ResponseEntity<List<ChangeRequest>> getAllChangeRequests() {
        log.info("Getting all change requests");
        return ResponseEntity.ok(changeRequestRepository.findAll());
    }

    @GetMapping("/pending")
    public ResponseEntity<List<ChangeRequest>> getPendingChangeRequests() {
        log.info("Getting pending change requests");
        return ResponseEntity.ok(changeRequestRepository.findByStatus("PENDING"));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ChangeRequest>> getChangeRequestsByProduct(@PathVariable UUID productId) {
        log.info("Getting change requests for product: {}", productId);
        return ResponseEntity.ok(changeRequestRepository.findByProductId(productId));
    }

    @PostMapping
    public ResponseEntity<ChangeRequest> createChangeRequest(@RequestBody Map<String, Object> request) {
        log.info("Creating change request");
        
        ChangeRequest changeRequest = ChangeRequest.builder()
            .productId(UUID.fromString((String) request.get("productId")))
            .changeType((String) request.get("changeType"))
            .fieldName((String) request.get("fieldName"))
            .oldValue((String) request.get("oldValue"))
            .newValue((String) request.get("newValue"))
            .status("PENDING")
            .requestedBy((String) request.getOrDefault("requestedBy", "admin@superapp.com"))
            .requestedAt(LocalDateTime.now())
            .build();

        ChangeRequest saved = changeRequestRepository.save(changeRequest);
        log.info("Change request created with ID: {}", saved.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<ChangeRequest> approveChangeRequest(@PathVariable UUID id) {
        log.info("Approving change request: {}", id);
        
        return changeRequestRepository.findById(id)
            .map(changeRequest -> {
                changeRequest.setStatus("APPROVED");
                changeRequest.setReviewedBy("admin@superapp.com");
                changeRequest.setReviewedAt(LocalDateTime.now());
                
                // Apply the change to the product
                productRepository.findById(changeRequest.getProductId())
                    .ifPresent(product -> {
                        switch (changeRequest.getFieldName()) {
                            case "status" -> product.setStatus(changeRequest.getNewValue());
                            case "maintenanceMode" -> product.setMaintenanceMode(Boolean.parseBoolean(changeRequest.getNewValue()));
                            case "whitelistMode" -> product.setWhitelistMode(Boolean.parseBoolean(changeRequest.getNewValue()));
                        }
                        productRepository.save(product);
                    });
                
                return ResponseEntity.ok(changeRequestRepository.save(changeRequest));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<ChangeRequest> rejectChangeRequest(@PathVariable UUID id, @RequestBody(required = false) String reason) {
        log.info("Rejecting change request: {}", id);
        
        return changeRequestRepository.findById(id)
            .map(changeRequest -> {
                changeRequest.setStatus("REJECTED");
                changeRequest.setReviewedBy("admin@superapp.com");
                changeRequest.setReviewedAt(LocalDateTime.now());
                changeRequest.setRejectionReason(reason != null ? reason : "Not approved");
                
                return ResponseEntity.ok(changeRequestRepository.save(changeRequest));
            })
            .orElse(ResponseEntity.notFound().build());
    }
}



