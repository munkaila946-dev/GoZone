package com.gozone.dto;

import com.gozone.entity.Ride;
import lombok.*;
import java.time.LocalDateTime;

public class RideDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RideRequest {
        private Ride.RideType rideType;
        private Double fare;
        private String pickupAddress;
        private Double pickupLatitude;
        private Double pickupLongitude;
        private String destinationAddress;
        private Double destLatitude;
        private Double destLongitude;
        private Double distanceKm;
        private Integer estimatedDurationMin;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RideResponse {
        private Long id;
        private Long riderId;
        private String riderName;
        private Long driverId;
        private String driverName;
        private Ride.RideType rideType;
        private Ride.RideStatus status;
        private Double fare;
        private String pickupAddress;
        private Double pickupLatitude;
        private Double pickupLongitude;
        private String destinationAddress;
        private Double destLatitude;
        private Double destLongitude;
        private Double distanceKm;
        private Integer estimatedDurationMin;
        private LocalDateTime createdAt;
        private LocalDateTime acceptedAt;
        private LocalDateTime pickedUpAt;
        private LocalDateTime completedAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FareEstimateRequest {
        private Double distanceKm;
        private Integer estimatedDurationMin;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FareEstimateOption {
        private Ride.RideType rideType;
        private String name;
        private Double fare;
        private Integer etaMin;
        private String description;
    }
}
