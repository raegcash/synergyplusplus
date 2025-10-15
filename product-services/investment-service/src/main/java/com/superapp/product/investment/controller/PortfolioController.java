package com.superapp.product.investment.controller;

import com.superapp.product.investment.dto.request.CreatePortfolioRequest;
import com.superapp.product.investment.dto.response.PortfolioResponse;
import com.superapp.product.investment.service.InvestmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/portfolios")
@RequiredArgsConstructor
@Tag(name = "Portfolios", description = "Investment portfolio management API")
public class PortfolioController {

    private final InvestmentService investmentService;

    @PostMapping
    @Operation(summary = "Create investment portfolio")
    public ResponseEntity<PortfolioResponse> createPortfolio(
            @RequestHeader("X-Tenant-Id") String tenantId,
            @Valid @RequestBody CreatePortfolioRequest request) {
        PortfolioResponse response = investmentService.createPortfolio(tenantId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{portfolioId}")
    @Operation(summary = "Get portfolio by ID")
    public ResponseEntity<PortfolioResponse> getPortfolio(
            @RequestHeader("X-Tenant-Id") String tenantId,
            @PathVariable UUID portfolioId) {
        PortfolioResponse response = investmentService.getPortfolio(portfolioId, tenantId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get user portfolios")
    public ResponseEntity<List<PortfolioResponse>> getUserPortfolios(
            @RequestHeader("X-Tenant-Id") String tenantId,
            @PathVariable UUID userId) {
        List<PortfolioResponse> response = investmentService.getUserPortfolios(tenantId, userId);
        return ResponseEntity.ok(response);
    }
}




