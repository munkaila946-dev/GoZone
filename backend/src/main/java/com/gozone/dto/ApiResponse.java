package com.gozone.dto;

import lombok.*;
import java.time.LocalDateTime;

/**
 * Generic API Response wrapper
 *
 * Every API response is wrapped in this for consistency:
 * {
 *   "success": true,
 *   "message": "Operation successful",
 *   "data": { ... },
 *   "timestamp": "2026-06-22T10:30:00"
 * }
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ApiResponse<T> {
    private Boolean success;
    private String message;
    private T data;
    private LocalDateTime timestamp;

    // Convenience factory methods
    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
