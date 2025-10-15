package com.superapp.marketplace.domain.controller;

import com.superapp.marketplace.domain.entity.Greylist;
import com.superapp.marketplace.domain.repository.GreylistRepository;
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
@RequestMapping("/greylist")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class GreylistController {

    private final GreylistRepository greylistRepository;

    @GetMapping
    public ResponseEntity<List<Greylist>> getAllGreylistEntries() {
        log.info("Getting all greylist entries");
        return ResponseEntity.ok(greylistRepository.findAll());
    }

    @GetMapping("/type/{listType}")
    public ResponseEntity<List<Greylist>> getGreylistByType(@PathVariable String listType) {
        log.info("Getting greylist entries by type: {}", listType);
        return ResponseEntity.ok(greylistRepository.findByListType(listType));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Greylist>> getGreylistByProduct(@PathVariable UUID productId) {
        log.info("Getting greylist entries for product: {}", productId);
        return ResponseEntity.ok(greylistRepository.findByProductId(productId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Greylist> getGreylistById(@PathVariable UUID id) {
        log.info("Getting greylist entry by id: {}", id);
        return greylistRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Greylist> createGreylistEntry(@RequestBody Map<String, Object> request) {
        log.info("Creating greylist entry");
        
        Greylist greylist = Greylist.builder()
            .userId(request.containsKey("userId") ? UUID.fromString((String) request.get("userId")) : null)
            .userEmail((String) request.get("userEmail"))
            .userName((String) request.get("userName"))
            .msisdn((String) request.get("msisdn"))
            .productId(UUID.fromString((String) request.get("productId")))
            .productCode((String) request.get("productCode"))
            .productName((String) request.get("productName"))
            .listType((String) request.get("listType"))
            .reason((String) request.get("reason"))
            .status((String) request.getOrDefault("status", "ACTIVE"))
            .expiresAt(request.containsKey("expiresAt") ? LocalDateTime.parse((String) request.get("expiresAt")) : null)
            .addedBy((String) request.getOrDefault("addedBy", "admin@superapp.com"))
            .addedAt(LocalDateTime.now())
            .build();

        Greylist saved = greylistRepository.save(greylist);
        log.info("Greylist entry created with ID: {}", saved.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Greylist> updateGreylistEntry(@PathVariable UUID id, @RequestBody Map<String, Object> request) {
        log.info("Updating greylist entry: {}", id);
        return greylistRepository.findById(id)
            .map(existing -> {
                if (request.containsKey("status")) {
                    existing.setStatus((String) request.get("status"));
                }
                if (request.containsKey("reason")) {
                    existing.setReason((String) request.get("reason"));
                }
                if (request.containsKey("expiresAt")) {
                    existing.setExpiresAt(LocalDateTime.parse((String) request.get("expiresAt")));
                }
                return ResponseEntity.ok(greylistRepository.save(existing));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGreylistEntry(@PathVariable UUID id) {
        log.info("Deleting greylist entry: {}", id);
        if (greylistRepository.existsById(id)) {
            greylistRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}



