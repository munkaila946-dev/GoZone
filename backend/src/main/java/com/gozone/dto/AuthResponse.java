package com.gozone.dto;

import lombok.*;

/**
 * AuthResponse DTO
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    private Long userId;
    private String name;
    private String phone;
    private String role;
    private Double walletBalance;
}
