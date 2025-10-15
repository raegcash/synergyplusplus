package com.superapp.core.risk.controller;

import com.superapp.core.risk.dto.response.RiskScoreResponse;
import com.superapp.core.risk.service.RiskMonitorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/risk/scores")
@RequiredArgsConstructor
@Tag(name = "Risk Scores", description = "Risk scoring API")
public class RiskScoreController {

    private final RiskMonitorService riskMonitorService;

    @PostMapping("/calculate/{userId}")
    @Operation(summary = "Calculate user risk score")
    public ResponseEntity<RiskScoreResponse> calculateRiskScore(
            @RequestHeader("X-Tenant-Id") String tenantId,
            @PathVariable UUID userId) {
        RiskScoreResponse response = riskMonitorService.calculateRiskScore(tenantId, userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get user risk score")
    public ResponseEntity<RiskScoreResponse> getUserRiskScore(
            @RequestHeader("X-Tenant-Id") String tenantId,
            @PathVariable UUID userId) {
        RiskScoreResponse response = riskMonitorService.getUserRiskScore(tenantId, userId);
        return ResponseEntity.ok(response);
    }
}




