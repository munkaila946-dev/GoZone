package com.gozone.config;

import com.gozone.dto.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * GlobalExceptionHandler — Catches all exceptions and returns clean JSON errors
 *
 * Instead of the user seeing an ugly 500 error page, they get:
 * {
 *   "success": false,
 *   "message": "Phone number already registered",
 *   "timestamp": "2026-06-22T10:30:00"
 * }
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handle RuntimeException (our main app errors)
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<Object>> handleRuntimeException(RuntimeException e) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(e.getMessage()));
    }

    /**
     * Handle any other unexpected exceptions
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleException(Exception e) {
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Something went wrong: " + e.getMessage()));
    }
}
