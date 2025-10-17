package com.superapp.core.identity.domain.exception;

/**
 * Exception thrown for unauthorized access
 */
public class UnauthorizedException extends RuntimeException {

    public UnauthorizedException(String message) {
        super(message);
    }
}




