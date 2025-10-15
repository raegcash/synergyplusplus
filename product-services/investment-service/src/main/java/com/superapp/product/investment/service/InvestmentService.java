package com.superapp.product.investment.service;

import com.superapp.product.investment.domain.entity.Portfolio;
import com.superapp.product.investment.domain.entity.Position;
import com.superapp.product.investment.domain.entity.Trade;
import com.superapp.product.investment.domain.enums.PositionStatus;
import com.superapp.product.investment.domain.enums.TradeType;
import com.superapp.product.investment.domain.exception.InsufficientFundsException;
import com.superapp.product.investment.domain.exception.ResourceNotFoundException;
import com.superapp.product.investment.dto.mapper.PortfolioMapper;
import com.superapp.product.investment.dto.mapper.PositionMapper;
import com.superapp.product.investment.dto.mapper.TradeMapper;
import com.superapp.product.investment.dto.request.CreatePortfolioRequest;
import com.superapp.product.investment.dto.request.ExecuteTradeRequest;
import com.superapp.product.investment.dto.response.PortfolioResponse;
import com.superapp.product.investment.dto.response.PositionResponse;
import com.superapp.product.investment.dto.response.TradeResponse;
import com.superapp.product.investment.repository.PortfolioRepository;
import com.superapp.product.investment.repository.PositionRepository;
import com.superapp.product.investment.repository.TradeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class InvestmentService {

    private final PortfolioRepository portfolioRepository;
    private final PositionRepository positionRepository;
    private final TradeRepository tradeRepository;
    private final PortfolioMapper portfolioMapper;
    private final PositionMapper positionMapper;
    private final TradeMapper tradeMapper;

    @Transactional
    public PortfolioResponse createPortfolio(String tenantId, CreatePortfolioRequest request) {
        log.info("Creating portfolio for tenant: {}, user: {}", tenantId, request.getUserId());

        Portfolio portfolio = Portfolio.builder()
                .tenantId(tenantId)
                .userId(request.getUserId())
                .name(request.getName())
                .totalValue(request.getCashBalance())
                .cashBalance(request.getCashBalance())
                .totalProfitLoss(BigDecimal.ZERO)
                .totalReturnPercent(BigDecimal.ZERO)
                .currency(request.getCurrency() != null ? request.getCurrency() : "USD")
                .isDefault(request.getIsDefault() != null ? request.getIsDefault() : false)
                .isActive(true)
                .build();

        Portfolio saved = portfolioRepository.save(portfolio);
        log.info("Portfolio created: {}", saved.getId());

        return portfolioMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public PortfolioResponse getPortfolio(UUID portfolioId, String tenantId) {
        Portfolio portfolio = portfolioRepository.findByIdAndTenantId(portfolioId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio", "id", portfolioId));
        return portfolioMapper.toResponse(portfolio);
    }

    @Transactional(readOnly = true)
    public List<PortfolioResponse> getUserPortfolios(String tenantId, UUID userId) {
        return portfolioRepository.findByTenantIdAndUserId(tenantId, userId)
                .stream()
                .map(portfolioMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public TradeResponse executeTrade(String tenantId, ExecuteTradeRequest request) {
        log.info("Executing trade for portfolio: {}, symbol: {}, type: {}", 
            request.getPortfolioId(), request.getSymbol(), request.getTradeType());

        Portfolio portfolio = portfolioRepository.findByIdAndTenantId(request.getPortfolioId(), tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio", "id", request.getPortfolioId()));

        BigDecimal totalAmount = request.getQuantity().multiply(request.getPrice());
        BigDecimal fees = totalAmount.multiply(BigDecimal.valueOf(0.001)); // 0.1% fee
        BigDecimal totalCost = totalAmount.add(fees);

        if (request.getTradeType() == TradeType.BUY || request.getTradeType() == TradeType.SHORT) {
            if (portfolio.getCashBalance().compareTo(totalCost) < 0) {
                throw new InsufficientFundsException("Insufficient funds in portfolio");
            }
            portfolio.setCashBalance(portfolio.getCashBalance().subtract(totalCost));
        } else {
            portfolio.setCashBalance(portfolio.getCashBalance().add(totalAmount).subtract(fees));
        }

        // Create trade record
        Trade trade = Trade.builder()
                .portfolioId(request.getPortfolioId())
                .symbol(request.getSymbol())
                .assetType(request.getAssetType())
                .tradeType(request.getTradeType())
                .quantity(request.getQuantity())
                .price(request.getPrice())
                .totalAmount(totalAmount)
                .fees(fees)
                .executedAt(LocalDateTime.now())
                .notes(request.getNotes())
                .build();

        // Update or create position
        Position position = updatePosition(portfolio.getId(), request, trade);
        trade.setPositionId(position.getId());

        Trade savedTrade = tradeRepository.save(trade);
        portfolioRepository.save(portfolio);

        log.info("Trade executed: {}", savedTrade.getId());
        return tradeMapper.toResponse(savedTrade);
    }

    private Position updatePosition(UUID portfolioId, ExecuteTradeRequest request, Trade trade) {
        List<Position> existingPositions = positionRepository.findByPortfolioId(portfolioId);
        Position existingPosition = existingPositions.stream()
                .filter(p -> p.getSymbol().equals(request.getSymbol()) && 
                           p.getStatus() == PositionStatus.OPEN)
                .findFirst()
                .orElse(null);

        if (existingPosition != null) {
            BigDecimal newQuantity;
            BigDecimal newAverage;

            if (request.getTradeType() == TradeType.BUY) {
                BigDecimal totalCost = existingPosition.getQuantity().multiply(existingPosition.getAveragePrice())
                        .add(request.getQuantity().multiply(request.getPrice()));
                newQuantity = existingPosition.getQuantity().add(request.getQuantity());
                newAverage = totalCost.divide(newQuantity, 4, RoundingMode.HALF_UP);
                existingPosition.setQuantity(newQuantity);
                existingPosition.setAveragePrice(newAverage);
            } else if (request.getTradeType() == TradeType.SELL) {
                newQuantity = existingPosition.getQuantity().subtract(request.getQuantity());
                existingPosition.setQuantity(newQuantity);
                if (newQuantity.compareTo(BigDecimal.ZERO) <= 0) {
                    existingPosition.setStatus(PositionStatus.CLOSED);
                    existingPosition.setClosedAt(LocalDateTime.now());
                }
            }

            return positionRepository.save(existingPosition);
        } else {
            Position newPosition = Position.builder()
                    .portfolioId(portfolioId)
                    .symbol(request.getSymbol())
                    .assetType(request.getAssetType())
                    .quantity(request.getQuantity())
                    .averagePrice(request.getPrice())
                    .currentPrice(request.getPrice())
                    .status(PositionStatus.OPEN)
                    .openedAt(LocalDateTime.now())
                    .build();
            return positionRepository.save(newPosition);
        }
    }

    @Transactional(readOnly = true)
    public List<PositionResponse> getPortfolioPositions(UUID portfolioId, String tenantId) {
        Portfolio portfolio = portfolioRepository.findByIdAndTenantId(portfolioId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio", "id", portfolioId));

        return positionRepository.findByPortfolioId(portfolio.getId())
                .stream()
                .map(positionMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<TradeResponse> getPortfolioTrades(UUID portfolioId, String tenantId, Pageable pageable) {
        Portfolio portfolio = portfolioRepository.findByIdAndTenantId(portfolioId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio", "id", portfolioId));

        return tradeRepository.findByPortfolioId(portfolio.getId(), pageable)
                .map(tradeMapper::toResponse);
    }
}




