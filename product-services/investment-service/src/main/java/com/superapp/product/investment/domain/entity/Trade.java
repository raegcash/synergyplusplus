package com.superapp.product.investment.domain.entity;

import com.superapp.product.investment.domain.enums.AssetType;
import com.superapp.product.investment.domain.enums.TradeType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "trades", indexes = {
    @Index(name = "idx_portfolio", columnList = "portfolioId"),
    @Index(name = "idx_position", columnList = "positionId"),
    @Index(name = "idx_executed_at", columnList = "executedAt")
})
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Trade extends AuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID portfolioId;

    private UUID positionId;

    @Column(nullable = false, length = 20)
    private String symbol;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AssetType assetType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private TradeType tradeType;

    @Column(precision = 19, scale = 8, nullable = false)
    private BigDecimal quantity;

    @Column(precision = 19, scale = 4, nullable = false)
    private BigDecimal price;

    @Column(precision = 19, scale = 4, nullable = false)
    private BigDecimal totalAmount;

    @Column(precision = 19, scale = 4)
    private BigDecimal fees;

    @Column(nullable = false)
    private LocalDateTime executedAt;

    @Column(columnDefinition = "TEXT")
    private String notes;
}




