package com.superapp.bff.admin.exception;

import com.superapp.bff.admin.dto.response.ApiResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;

import java.util.Arrays;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Unit tests for GlobalExceptionHandler
 */
class GlobalExceptionHandlerTest {
    
    private GlobalExceptionHandler exceptionHandler;
    
    @BeforeEach
    void setUp() {
        exceptionHandler = new GlobalExceptionHandler();
    }
    
    @Test
    void handleResourceNotFound_shouldReturn404() {
        // Given
        ResourceNotFoundException exception = new ResourceNotFoundException("Product", "123");
        
        // When
        ResponseEntity<ApiResponse<Void>> response = exceptionHandler.handleResourceNotFound(exception);
        
        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isFalse();
        assertThat(response.getBody().getMessage()).contains("Product").contains("123");
    }
    
    @Test
    void handleValidation_shouldReturn400() {
        // Given
        ValidationException exception = new ValidationException("Invalid product code");
        
        // When
        ResponseEntity<ApiResponse<Void>> response = exceptionHandler.handleValidation(exception);
        
        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isFalse();
        assertThat(response.getBody().getMessage()).isEqualTo("Invalid product code");
    }
    
    @Test
    void handleServiceUnavailable_shouldReturn503() {
        // Given
        ServiceUnavailableException exception = new ServiceUnavailableException("Product Catalog");
        
        // When
        ResponseEntity<ApiResponse<Void>> response = exceptionHandler.handleServiceUnavailable(exception);
        
        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isFalse();
        assertThat(response.getBody().getMessage()).contains("Product Catalog");
    }
    
    @Test
    void handleMethodArgumentNotValid_shouldReturn400WithFieldErrors() {
        // Given
        MethodArgumentNotValidException exception = mock(MethodArgumentNotValidException.class);
        BindingResult bindingResult = mock(BindingResult.class);
        
        FieldError error1 = new FieldError("product", "code", "must not be null");
        FieldError error2 = new FieldError("product", "name", "must not be blank");
        
        when(exception.getBindingResult()).thenReturn(bindingResult);
        when(bindingResult.getFieldErrors()).thenReturn(Arrays.asList(error1, error2));
        
        // When
        ResponseEntity<ApiResponse<Void>> response = exceptionHandler.handleMethodArgumentNotValid(exception);
        
        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isFalse();
        assertThat(response.getBody().getMessage()).contains("Validation failed");
        assertThat(response.getBody().getMessage()).contains("code");
        assertThat(response.getBody().getMessage()).contains("name");
    }
    
    @Test
    void handleHttpClientError_shouldReturnSameStatusCode() {
        // Given
        HttpClientErrorException exception = HttpClientErrorException.create(
                HttpStatus.NOT_FOUND,
                "Not Found",
                null,
                null,
                null
        );
        
        // When
        ResponseEntity<ApiResponse<Void>> response = exceptionHandler.handleHttpClientError(exception);
        
        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isFalse();
        assertThat(response.getBody().getMessage()).contains("Backend service error");
    }
    
    @Test
    void handleHttpServerError_shouldReturn500() {
        // Given
        HttpServerErrorException exception = HttpServerErrorException.create(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Internal Server Error",
                null,
                null,
                null
        );
        
        // When
        ResponseEntity<ApiResponse<Void>> response = exceptionHandler.handleHttpServerError(exception);
        
        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isFalse();
        assertThat(response.getBody().getMessage()).contains("Backend service error");
    }
    
    @Test
    void handleResourceAccess_shouldReturn503() {
        // Given
        ResourceAccessException exception = new ResourceAccessException("Connection refused");
        
        // When
        ResponseEntity<ApiResponse<Void>> response = exceptionHandler.handleResourceAccess(exception);
        
        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isFalse();
        assertThat(response.getBody().getMessage()).contains("Unable to connect");
    }
    
    @Test
    void handleGenericException_shouldReturn500() {
        // Given
        Exception exception = new RuntimeException("Unexpected error");
        
        // When
        ResponseEntity<ApiResponse<Void>> response = exceptionHandler.handleGenericException(exception);
        
        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isFalse();
        assertThat(response.getBody().getMessage()).contains("Unexpected error");
    }
}

