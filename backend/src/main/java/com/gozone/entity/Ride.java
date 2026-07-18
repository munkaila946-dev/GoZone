package com.gozone.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Ride Entity — GoRide records
 *
 * Ride Types:
 *   - GO_POOL:    Shared ride (cheapest)
 *   - GO_STANDARD: Standard car
 *   - GO_PREMIUM:  Luxury car
 *
 * Ride Flow:
 *   SEARCHING → ACCEPTED → ARRIVING → IN_PROGRESS → COMPLETED
 */
@Entity
@Table(name = "rides")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ride {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rider_id", nullable = false)
    private User rider;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id")
    private User driver;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RideType rideType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private RideStatus status = RideStatus.SEARCHING;

    @Column(nullable = false)
    private Double fare;

    // ===== Pickup Location =====
    @Column(nullable = false)
    private String pickupAddress;

    private Double pickupLatitude;
    private Double pickupLongitude;

    // ===== Destination =====
    @Column(nullable = false)
    private String destinationAddress;

    private Double destLatitude;
    private Double destLongitude;

    // Distance in kilometers
    private Double distanceKm;

    // Estimated time in minutes
    private Integer estimatedDurationMin;

    // ===== Timestamps =====
    private LocalDateTime acceptedAt;
    private LocalDateTime pickedUpAt;
    private LocalDateTime completedAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // Rating given by rider after trip
    private Integer riderRating;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // ===== Enums =====
    public enum RideType {
        GO_POOL,
        GO_STANDARD,
        GO_PREMIUM
    }

    public enum RideStatus {
        SEARCHING,     // Looking for driver
        ACCEPTED,      // Driver found
        ARRIVING,      // Driver heading to pickup
        IN_PROGRESS,   // Ride in progress
        COMPLETED,     // Ride finished
        CANCELLED      // Ride cancelled
    }
}
