package com.superapp.bff.admin.dto.response;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for ApiResponse
 */
class ApiResponseTest {
    
    @Test
    void success_withData_shouldCreateSuccessResponse() {
        // Given
        String data = "Test data";
        
        // When
        ApiResponse<String> response = ApiResponse.success(data);
        
        // Then
        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getMessage()).isEqualTo("Operation successful");
        assertThat(response.getData()).isEqualTo(data);
        assertThat(response.getTimestamp()).isNotNull();
    }
    
    @Test
    void success_withMessageAndData_shouldCreateSuccessResponse() {
        // Given
        String message = "Custom success message";
        String data = "Test data";
        
        // When
        ApiResponse<String> response = ApiResponse.success(message, data);
        
        // Then
        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getMessage()).isEqualTo(message);
        assertThat(response.getData()).isEqualTo(data);
        assertThat(response.getTimestamp()).isNotNull();
    }
    
    @Test
    void error_withMessage_shouldCreateErrorResponse() {
        // Given
        String errorMessage = "Something went wrong";
        
        // When
        ApiResponse<Void> response = ApiResponse.error(errorMessage);
        
        // Then
        assertThat(response.isSuccess()).isFalse();
        assertThat(response.getMessage()).isEqualTo(errorMessage);
        assertThat(response.getData()).isNull();
        assertThat(response.getTimestamp()).isNotNull();
    }
    
    @Test
    void builder_shouldCreateCustomResponse() {
        // Given & When
        ApiResponse<String> response = ApiResponse.<String>builder()
                .success(true)
                .message("Custom message")
                .data("Custom data")
                .build();
        
        // Then
        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getMessage()).isEqualTo("Custom message");
        assertThat(response.getData()).isEqualTo("Custom data");
    }
}

