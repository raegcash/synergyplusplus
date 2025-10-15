package com.superapp.marketplace.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "approvals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Approval extends BaseEntity {

    // Polymorphic Reference
    @Column(name = "item_type", nullable = false, length = 50)
    private String itemType;

    @Column(name = "item_id", nullable = false)
    private UUID itemId;

    // Approval Details
    @Column(nullable = false, length = 50)
    private String status = "PENDING";

    private Integer priority = 0;

    // Workflow Position
    @Column(name = "current_step", length = 100)
    private String currentStep;

    @Column(name = "next_step", length = 100)
    private String nextStep;

    @Column(name = "hierarchy_level")
    private Integer hierarchyLevel = 1;

    // Decision
    @Column(name = "approved_by")
    private String approvedBy;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "rejected_by")
    private String rejectedBy;

    @Column(name = "rejected_at")
    private LocalDateTime rejectedAt;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    // Metadata
    @Column(name = "submitted_by", nullable = false)
    private String submittedBy;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;
}



