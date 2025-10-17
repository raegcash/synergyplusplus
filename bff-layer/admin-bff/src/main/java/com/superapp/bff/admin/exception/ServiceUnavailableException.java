package com.superapp.bff.admin.exception;

public class ServiceUnavailableException extends RuntimeException {
    public ServiceUnavailableException(String message) {
        super(message);
    }
    
    public ServiceUnavailableException(String service, Throwable cause) {
        super(String.format("Service '%s' is currently unavailable", service), cause);
    }
}

