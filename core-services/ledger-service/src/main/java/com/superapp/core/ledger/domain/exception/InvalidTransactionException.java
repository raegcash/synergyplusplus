package com.superapp.core.ledger.domain.exception;

/**
 * Exception thrown for invalid transactions (e.g., unbalanced entries)
 */
public class InvalidTransactionException extends RuntimeException {

    public InvalidTransactionException(String message) {
        super(message);
    }
}




