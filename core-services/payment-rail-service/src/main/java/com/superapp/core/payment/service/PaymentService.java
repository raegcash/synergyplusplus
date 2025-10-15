package com.superapp.core.payment.service;

import com.superapp.core.payment.domain.entity.PaymentTransaction;
import com.superapp.core.payment.domain.enums.PaymentStatus;
import com.superapp.core.payment.domain.exception.PaymentException;
import com.superapp.core.payment.domain.exception.ResourceNotFoundException;
import com.superapp.core.payment.dto.mapper.PaymentMapper;
import com.superapp.core.payment.dto.request.InitiatePaymentRequest;
import com.superapp.core.payment.dto.response.PaymentTransactionResponse;
import com.superapp.core.payment.repository.PaymentTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Payment processing service
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentTransactionRepository transactionRepository;
    private final PaymentMapper paymentMapper;

    @Transactional
    public PaymentTransactionResponse initiatePayment(String tenantId, InitiatePaymentRequest request) {
        log.info("Initiating payment for tenant: {}, user: {}, amount: {} {}", 
            tenantId, request.getUserId(), request.getAmount(), request.getCurrency());

        // Create payment transaction
        PaymentTransaction transaction = PaymentTransaction.builder()
                .tenantId(tenantId)
                .userId(request.getUserId())
                .amount(request.getAmount())
                .currency(request.getCurrency())
                .status(PaymentStatus.PENDING)
                .provider(request.getProvider())
                .paymentMethodId(request.getPaymentMethodId() != null ? request.getPaymentMethodId().toString() : null)
                .metadata(request.getMetadata())
                .build();

        PaymentTransaction saved = transactionRepository.save(transaction);
        log.info("Payment initiated: {}", saved.getId());

        // In real implementation, call external payment provider here
        // For now, we'll simulate async processing
        
        return paymentMapper.toResponse(saved);
    }

    @Transactional
    public PaymentTransactionResponse processPayment(UUID transactionId, String tenantId) {
        log.info("Processing payment: {}", transactionId);

        PaymentTransaction transaction = transactionRepository
                .findByIdAndTenantId(transactionId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("PaymentTransaction", "id", transactionId));

        if (transaction.getStatus() != PaymentStatus.PENDING) {
            throw new PaymentException("Payment already processed");
        }

        try {
            // Simulate payment processing
            // In real implementation, call external payment provider API
            transaction.setStatus(PaymentStatus.PROCESSING);
            transactionRepository.save(transaction);

            // Simulate successful payment
            transaction.setStatus(PaymentStatus.COMPLETED);
            transaction.setCompletedAt(LocalDateTime.now());
            transaction.setExternalReference("PAY-" + UUID.randomUUID());

            PaymentTransaction completed = transactionRepository.save(transaction);
            log.info("Payment completed: {}", completed.getId());

            return paymentMapper.toResponse(completed);
        } catch (Exception e) {
            log.error("Payment failed: {}", transactionId, e);
            transaction.setStatus(PaymentStatus.FAILED);
            transaction.setFailedAt(LocalDateTime.now());
            transaction.setErrorMessage(e.getMessage());
            transactionRepository.save(transaction);
            throw new PaymentException("Payment processing failed", e);
        }
    }

    @Transactional(readOnly = true)
    public PaymentTransactionResponse getTransaction(UUID transactionId, String tenantId) {
        PaymentTransaction transaction = transactionRepository
                .findByIdAndTenantId(transactionId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("PaymentTransaction", "id", transactionId));

        return paymentMapper.toResponse(transaction);
    }

    @Transactional(readOnly = true)
    public Page<PaymentTransactionResponse> getUserTransactions(String tenantId, UUID userId, Pageable pageable) {
        return transactionRepository
                .findByTenantIdAndUserId(tenantId, userId, pageable)
                .map(paymentMapper::toResponse);
    }
}




