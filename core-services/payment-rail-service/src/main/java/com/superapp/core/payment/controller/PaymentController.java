package com.superapp.core.payment.controller;

import com.superapp.core.payment.dto.request.InitiatePaymentRequest;
import com.superapp.core.payment.dto.response.PaymentTransactionResponse;
import com.superapp.core.payment.service.PaymentService;
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

/**
 * Payment processing REST controller
 */
@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Payment processing API")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    @Operation(summary = "Initiate payment transaction")
    public ResponseEntity<PaymentTransactionResponse> initiatePayment(
            @RequestHeader("X-Tenant-Id") String tenantId,
            @Valid @RequestBody InitiatePaymentRequest request) {
        PaymentTransactionResponse response = paymentService.initiatePayment(tenantId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/{transactionId}/process")
    @Operation(summary = "Process pending payment")
    public ResponseEntity<PaymentTransactionResponse> processPayment(
            @RequestHeader("X-Tenant-Id") String tenantId,
            @PathVariable UUID transactionId) {
        PaymentTransactionResponse response = paymentService.processPayment(transactionId, tenantId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{transactionId}")
    @Operation(summary = "Get payment transaction by ID")
    public ResponseEntity<PaymentTransactionResponse> getTransaction(
            @RequestHeader("X-Tenant-Id") String tenantId,
            @PathVariable UUID transactionId) {
        PaymentTransactionResponse response = paymentService.getTransaction(transactionId, tenantId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get user payment transactions")
    public ResponseEntity<Page<PaymentTransactionResponse>> getUserTransactions(
            @RequestHeader("X-Tenant-Id") String tenantId,
            @PathVariable UUID userId,
            Pageable pageable) {
        Page<PaymentTransactionResponse> response = paymentService.getUserTransactions(tenantId, userId, pageable);
        return ResponseEntity.ok(response);
    }
}




