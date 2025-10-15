package com.superapp.core.ledger.controller;

import com.superapp.core.ledger.dto.request.CreateAccountRequest;
import com.superapp.core.ledger.dto.response.AccountResponse;
import com.superapp.core.ledger.service.AccountService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Account Controller
 * Manages ledger accounts
 */
@RestController
@RequestMapping("/api/v1/accounts")
@RequiredArgsConstructor
@Tag(name = "Accounts", description = "Ledger Account Management API")
public class AccountController {

    private final AccountService accountService;

    @PostMapping
    @Operation(summary = "Create new account")
    public ResponseEntity<AccountResponse> createAccount(@Valid @RequestBody CreateAccountRequest request) {
        AccountResponse response = accountService.createAccount(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{accountId}")
    @Operation(summary = "Get account by ID")
    public ResponseEntity<AccountResponse> getAccountById(@PathVariable UUID accountId) {
        AccountResponse response = accountService.getAccountById(accountId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/code/{accountCode}")
    @Operation(summary = "Get account by code")
    public ResponseEntity<AccountResponse> getAccountByCode(@PathVariable String accountCode) {
        AccountResponse response = accountService.getAccountByCode(accountCode);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/tenant/{tenantId}")
    @Operation(summary = "Get accounts by tenant")
    public ResponseEntity<List<AccountResponse>> getAccountsByTenant(@PathVariable String tenantId) {
        List<AccountResponse> response = accountService.getAccountsByTenant(tenantId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get accounts by user")
    public ResponseEntity<List<AccountResponse>> getAccountsByUser(@PathVariable UUID userId) {
        List<AccountResponse> response = accountService.getAccountsByUser(userId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{accountId}")
    @Operation(summary = "Deactivate account")
    public ResponseEntity<Void> deactivateAccount(@PathVariable UUID accountId) {
        accountService.deactivateAccount(accountId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/code/{accountCode}/balance")
    @Operation(summary = "Get account balance")
    public ResponseEntity<BigDecimal> getAccountBalance(@PathVariable String accountCode) {
        BigDecimal balance = accountService.getAccountBalance(accountCode);
        return ResponseEntity.ok(balance);
    }
}




