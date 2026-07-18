package com.gozone.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

/**
 * User Entity — Represents all users in GoZone
 *
 * Roles:
 *   - CUSTOMER: Orders rides and food
 *   - DRIVER:   Drives for GoRide
 *   - RESTAURANT: Owns a restaurant on GoBite
 *   - ADMIN:    Manages the platform
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String phone;

    @Column(unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private UserRole role = UserRole.CUSTOMER;

    private String avatarUrl;

    private String pushToken;

    private Boolean isActive;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // ===== Relationship: One User → One Wallet =====
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Wallet wallet;

    // ===== Relationship: One User → Many Saved Locations =====
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<SavedLocation> savedLocations;

    // ===== Auto-set timestamps =====
    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.isActive == null) this.isActive = true;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // ===== User Role Enum =====
    public enum UserRole {
        CUSTOMER,
        DRIVER,
        RESTAURANT,
        ADMIN
    }
}
