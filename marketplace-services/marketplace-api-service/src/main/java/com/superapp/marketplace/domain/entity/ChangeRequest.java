package com.superapp.marketplace.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "change_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChangeRequest extends BaseEntity {

    @Column(name = "product_id", nullable = false)
    private UUID productId;

    // Change Details
    @Column(name = "change_type", nullable = false, length = 50)
    private String changeType;

    @Column(name = "field_name", nullable = false, length = 100)
    private String fieldName;

    @Column(name = "old_value", columnDefinition = "TEXT")
    private String oldValue;

    @Column(name = "new_value", nullable = false, columnDefinition = "TEXT")
    private String newValue;

    // Status
    @Column(nullable = false, length = 50)
    private String status = "PENDING";

    // Decision
    @Column(name = "requested_by", nullable = false)
    private String requestedBy;

    @Column(name = "requested_at")
    private LocalDateTime requestedAt;

    @Column(name = "reviewed_by")
    private String reviewedBy;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;
}



