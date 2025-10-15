package com.superapp.marketplace.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "assets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Asset extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partner_id", nullable = false)
    private Partner partner;

    // Basic Info
    @Column(nullable = false)
    private String name;

    @Column(nullable = false, length = 50)
    private String symbol;

    @Column(name = "asset_code", unique = true, nullable = false, length = 50)
    private String assetCode;

    @Column(name = "asset_type", nullable = false, length = 50)
    private String assetType;

    @Column(columnDefinition = "TEXT")
    private String description;

    // Pricing
    @Column(name = "current_price", nullable = false, precision = 18, scale = 8)
    private BigDecimal currentPrice;

    @Column(name = "price_currency", length = 3)
    private String priceCurrency = "PHP";

    @Column(name = "min_investment", nullable = false, precision = 18, scale = 2)
    private BigDecimal minInvestment;

    @Column(name = "max_investment", nullable = false, precision = 18, scale = 2)
    private BigDecimal maxInvestment;

    // UITF/Fund Specific Fields
    @Column(name = "investment_amount", precision = 18, scale = 2)
    private BigDecimal investmentAmount;

    @Column(name = "indicative_units", precision = 18, scale = 8)
    private BigDecimal indicativeUnits;

    @Column(name = "indicative_navpu", precision = 18, scale = 8)
    private BigDecimal indicativeNavpu;

    @Column(name = "nav_as_of_date")
    private LocalDate navAsOfDate;

    @Column(name = "nav_per_unit", precision = 18, scale = 8)
    private BigDecimal navPerUnit;

    // Risk & Performance
    @Column(name = "risk_level", length = 50)
    private String riskLevel;

    @Column(name = "historical_return", precision = 10, scale = 2)
    private BigDecimal historicalReturn;

    @Column(name = "year_to_date_return", precision = 10, scale = 2)
    private BigDecimal yearToDateReturn;

    // Status
    @Column(nullable = false, length = 50)
    private String status = "PENDING_APPROVAL";

    @Column(name = "submission_source", length = 50)
    private String submissionSource;

    // Metadata
    @Column(name = "submitted_by")
    private String submittedBy;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;
}



