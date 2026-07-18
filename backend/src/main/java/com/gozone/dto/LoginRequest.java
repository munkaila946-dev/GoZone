package com.gozone.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

/**
 * LoginRequest DTO
 */
@Data
public class LoginRequest {
    @NotBlank(message = "Phone number is required")
    private String phone;

    @NotBlank(message = "Password is required")
    private String password;
}
