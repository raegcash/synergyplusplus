package com.superapp.marketplace.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "greylist")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Greylist extends BaseEntity {

    // User Reference
    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "user_email", nullable = false)
    private String userEmail;

    @Column(name = "user_name", nullable = false)
    private String userName;

    private String msisdn;

    // Product Reference
    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @Column(name = "product_code", nullable = false, length = 50)
    private String productCode;

    @Column(name = "product_name", nullable = false)
    private String productName;

    // List Type
    @Column(name = "list_type", nullable = false, length = 50)
    private String listType;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;

    // Status & Expiry
    @Column(length = 50)
    private String status = "ACTIVE";

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    // Metadata
    @Column(name = "added_by", nullable = false)
    private String addedBy;

    @Column(name = "added_at")
    private LocalDateTime addedAt;
}



