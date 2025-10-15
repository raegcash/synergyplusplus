package com.superapp.core.risk.controller;

import com.superapp.core.risk.domain.enums.AlertStatus;
import com.superapp.core.risk.dto.request.CreateRiskAlertRequest;
import com.superapp.core.risk.dto.response.RiskAlertResponse;
import com.superapp.core.risk.service.RiskMonitorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/risk/alerts")
@RequiredArgsConstructor
@Tag(name = "Risk Alerts", description = "Risk alert management API")
public class RiskAlertController {

    private final RiskMonitorService riskMonitorService;

    @PostMapping
    @Operation(summary = "Create risk alert")
    public ResponseEntity<RiskAlertResponse> createAlert(
            @RequestHeader("X-Tenant-Id") String tenantId,
            @Valid @RequestBody CreateRiskAlertRequest request) {
        RiskAlertResponse response = riskMonitorService.createAlert(tenantId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{alertId}")
    @Operation(summary = "Get risk alert by ID")
    public ResponseEntity<RiskAlertResponse> getAlert(
            @RequestHeader("X-Tenant-Id") String tenantId,
            @PathVariable UUID alertId) {
        RiskAlertResponse response = riskMonitorService.getAlert(alertId, tenantId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get user risk alerts")
    public ResponseEntity<Page<RiskAlertResponse>> getUserAlerts(
            @RequestHeader("X-Tenant-Id") String tenantId,
            @PathVariable UUID userId,
            Pageable pageable) {
        Page<RiskAlertResponse> response = riskMonitorService.getUserAlerts(tenantId, userId, pageable);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{alertId}/status")
    @Operation(summary = "Update alert status")
    public ResponseEntity<RiskAlertResponse> updateStatus(
            @RequestHeader("X-Tenant-Id") String tenantId,
            @PathVariable UUID alertId,
            @RequestParam AlertStatus status) {
        RiskAlertResponse response = riskMonitorService.updateAlertStatus(alertId, tenantId, status);
        return ResponseEntity.ok(response);
    }
}




