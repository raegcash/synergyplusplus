package com.superapp.product.investment.controller;

import com.superapp.product.investment.dto.request.ExecuteTradeRequest;
import com.superapp.product.investment.dto.response.PositionResponse;
import com.superapp.product.investment.dto.response.TradeResponse;
import com.superapp.product.investment.service.InvestmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/trades")
@RequiredArgsConstructor
@Tag(name = "Trades", description = "Trading execution API")
public class TradeController {

    private final InvestmentService investmentService;

    @PostMapping("/execute")
    @Operation(summary = "Execute trade")
    public ResponseEntity<TradeResponse> executeTrade(
            @RequestHeader("X-Tenant-Id") String tenantId,
            @Valid @RequestBody ExecuteTradeRequest request) {
        TradeResponse response = investmentService.executeTrade(tenantId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/portfolio/{portfolioId}")
    @Operation(summary = "Get portfolio trades")
    public ResponseEntity<Page<TradeResponse>> getPortfolioTrades(
            @RequestHeader("X-Tenant-Id") String tenantId,
            @PathVariable UUID portfolioId,
            Pageable pageable) {
        Page<TradeResponse> response = investmentService.getPortfolioTrades(portfolioId, tenantId, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/portfolio/{portfolioId}/positions")
    @Operation(summary = "Get portfolio positions")
    public ResponseEntity<List<PositionResponse>> getPortfolioPositions(
            @RequestHeader("X-Tenant-Id") String tenantId,
            @PathVariable UUID portfolioId) {
        List<PositionResponse> response = investmentService.getPortfolioPositions(portfolioId, tenantId);
        return ResponseEntity.ok(response);
    }
}




