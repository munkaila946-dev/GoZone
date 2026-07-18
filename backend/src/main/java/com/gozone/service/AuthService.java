package com.gozone.service;

import com.gozone.dto.*;
import com.gozone.entity.*;
import com.gozone.repository.*;
import com.gozone.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * AuthService — Handles user registration, login, and token generation
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       WalletRepository walletRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.walletRepository = walletRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    /**
     * Register a new user
     * - Validates phone number isn't already taken
     * - Hashes the password
     * - Creates user + wallet
     * - Returns JWT token
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check if phone already exists
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("Phone number already registered");
        }

        // Check if email already exists (if provided)
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email already registered");
            }
        }

        // Create new user
        User user = User.builder()
                .name(request.getName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(User.UserRole.CUSTOMER)
                .isActive(true)
                .build();

        user = userRepository.save(user);

        // Auto-create wallet for the new user
        Wallet wallet = Wallet.builder()
                .user(user)
                .balance(0.0)
                .currency("GHS")
                .isActive(true)
                .build();
        walletRepository.save(wallet);

        // Generate JWT token
        String token = jwtService.generateToken(user.getId(), user.getPhone(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .name(user.getName())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .walletBalance(wallet.getBalance())
                .build();
    }

    /**
     * Login existing user
     * - Finds user by phone
     * - Verifies password
     * - Returns JWT token
     */
    public AuthResponse login(LoginRequest request) {
        // Find user by phone
        User user = userRepository.findByPhone(request.getPhone())
                .orElseThrow(() -> new RuntimeException("User not found with phone: " + request.getPhone()));

        // Check if account is active
        if (!user.getIsActive()) {
            throw new RuntimeException("Account is deactivated. Please contact support.");
        }

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid phone number or password");
        }

        // Get wallet balance
        Double balance = walletRepository.findByUserId(user.getId())
                .map(Wallet::getBalance)
                .orElse(0.0);

        // Generate JWT token
        String token = jwtService.generateToken(user.getId(), user.getPhone(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .name(user.getName())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .walletBalance(balance)
                .build();
    }

    /**
     * Get current user info from token
     */
    public User getCurrentUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    /**
     * Update user's Expo push token
     */
    @Transactional
    public void updatePushToken(Long userId, String token) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setPushToken(token);
        userRepository.save(user);
    }
}
