package com.gozone.controller;

import com.gozone.dto.*;
import com.gozone.entity.User;
import com.gozone.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * AuthController — Authentication endpoints
 *
 * Endpoints:
 *   POST /api/auth/register    → Register new user
 *   POST /api/auth/login       → Login existing user
 *   GET  /api/auth/me          → Get current user info
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Register a new user
     * POST /api/auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(
                ApiResponse.success("Registration successful", response)
        );
    }

    /**
     * Login
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(
                ApiResponse.success("Login successful", response)
        );
    }

    /**
     * Get current logged-in user info
     * GET /api/auth/me
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<User>> getCurrentUser(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        User user = authService.getCurrentUser(userId);
        return ResponseEntity.ok(
                ApiResponse.success("User info retrieved", user)
        );
    }

    /**
     * Update current user's push token
     * POST /api/auth/push-token
     * Body: { "token": "ExponentPushToken[xxxx]" }
     */
    @PostMapping("/push-token")
    public ResponseEntity<ApiResponse<Void>> updatePushToken(
            Authentication authentication,
            @RequestBody java.util.Map<String, String> body
    ) {
        Long userId = (Long) authentication.getPrincipal();
        String token = body.get("token");
        authService.updatePushToken(userId, token);
        return ResponseEntity.ok(
                ApiResponse.success("Push token updated successfully", null)
        );
    }
}
