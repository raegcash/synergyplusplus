package com.superapp.core.identity.domain.exception;

/**
 * Exception thrown for bad request errors
 */
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }
}




