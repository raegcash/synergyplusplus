package com.superapp.product.investment.domain.entity;

import com.superapp.product.investment.domain.enums.AssetType;
import com.superapp.product.investment.domain.enums.PositionStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "positions", indexes = {
    @Index(name = "idx_portfolio", columnList = "portfolioId"),
    @Index(name = "idx_status", columnList = "status"),
    @Index(name = "idx_symbol", columnList = "symbol")
})
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Position extends AuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID portfolioId;

    @Column(nullable = false, length = 20)
    private String symbol;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AssetType assetType;

    @Column(precision = 19, scale = 8, nullable = false)
    private BigDecimal quantity;

    @Column(precision = 19, scale = 4, nullable = false)
    private BigDecimal averagePrice;

    @Column(precision = 19, scale = 4)
    private BigDecimal currentPrice;

    @Column(precision = 19, scale = 4)
    private BigDecimal marketValue;

    @Column(precision = 19, scale = 4)
    private BigDecimal profitLoss;

    @Column(precision = 10, scale = 4)
    private BigDecimal returnPercent;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PositionStatus status;

    private LocalDateTime openedAt;

    private LocalDateTime closedAt;
}




