package com.superapp.core.ledger.controller;

import com.superapp.core.ledger.dto.request.CreateTransactionRequest;
import com.superapp.core.ledger.dto.response.TransactionResponse;
import com.superapp.core.ledger.service.LedgerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Transaction Controller
 * Manages financial transactions
 */
@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
@Tag(name = "Transactions", description = "Transaction Management API")
public class TransactionController {

    private final LedgerService ledgerService;

    @PostMapping
    @Operation(summary = "Create new transaction")
    public ResponseEntity<TransactionResponse> createTransaction(@Valid @RequestBody CreateTransactionRequest request) {
        TransactionResponse response = ledgerService.createTransaction(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{transactionId}")
    @Operation(summary = "Get transaction by ID")
    public ResponseEntity<TransactionResponse> getTransaction(@PathVariable UUID transactionId) {
        TransactionResponse response = ledgerService.getTransaction(transactionId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/tenant/{tenantId}")
    @Operation(summary = "Get transactions by tenant")
    public ResponseEntity<List<TransactionResponse>> getTransactionsByTenant(@PathVariable String tenantId) {
        List<TransactionResponse> response = ledgerService.getTransactionsByTenant(tenantId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/tenant/{tenantId}/date-range")
    @Operation(summary = "Get transactions by date range")
    public ResponseEntity<List<TransactionResponse>> getTransactionsByDateRange(
            @PathVariable String tenantId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<TransactionResponse> response = ledgerService.getTransactionsByDateRange(tenantId, startDate, endDate);
        return ResponseEntity.ok(response);
    }
}




