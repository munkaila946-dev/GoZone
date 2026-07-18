package com.gozone.service;

import com.gozone.dto.RideDtos.*;
import com.gozone.entity.*;
import com.gozone.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RideService {

    private final RideRepository rideRepository;
    private final UserRepository userRepository;
    private final WalletService walletService;
    private final WebSocketService webSocketService;
    private final NotificationService notificationService;

    public RideService(RideRepository rideRepository,
                       UserRepository userRepository,
                       WalletService walletService,
                       WebSocketService webSocketService,
                       NotificationService notificationService) {
        this.rideRepository = rideRepository;
        this.userRepository = userRepository;
        this.walletService = walletService;
        this.webSocketService = webSocketService;
        this.notificationService = notificationService;
    }

    /**
     * Calculate estimated fares for all available ride types
     */
    public List<FareEstimateOption> estimateFares(Double distanceKm, Integer durationMin) {
        double dist = distanceKm != null ? distanceKm : 5.0;
        int dur = durationMin != null ? durationMin : 15;

        // Base formula: 10 GHS base + 2.50/km + 0.50/min
        double baseFare = 10.0 + (dist * 2.50) + (dur * 0.50);

        return List.of(
            FareEstimateOption.builder()
                .rideType(Ride.RideType.STANDARD)
                .name("GoStandard")
                .fare(Math.round(baseFare * 100.0) / 100.0)
                .etaMin(3)
                .description("Affordable, everyday ride")
                .build(),
            FareEstimateOption.builder()
                .rideType(Ride.RideType.COMFORT)
                .name("GoComfort")
                .fare(Math.round(baseFare * 1.40 * 100.0) / 100.0)
                .etaMin(5)
                .description("Newer cars with extra legroom & A/C")
                .build(),
            FareEstimateOption.builder()
                .rideType(Ride.RideType.POOL)
                .name("GoPool (Dynamic)")
                .fare(Math.round(baseFare * 0.70 * 100.0) / 100.0)
                .etaMin(6)
                .description("Share your ride & save 30%")
                .build(),
            FareEstimateOption.builder()
                .rideType(Ride.RideType.BIKER)
                .name("GoBiker")
                .fare(Math.round(baseFare * 0.50 * 100.0) / 100.0)
                .etaMin(2)
                .description("Beat traffic fast on a motorbike")
                .build()
        );
    }

    /**
     * Book a new ride request
     */
    @Transactional
    public RideResponse requestRide(Long riderId, RideRequest request) {
        User rider = userRepository.findById(riderId)
                .orElseThrow(() -> new RuntimeException("Rider not found: " + riderId));

        // Create ride request
        Ride ride = Ride.builder()
                .rider(rider)
                .rideType(request.getRideType())
                .status(Ride.RideStatus.SEARCHING)
                .fare(request.getFare())
                .pickupAddress(request.getPickupAddress())
                .pickupLatitude(request.getPickupLatitude())
                .pickupLongitude(request.getPickupLongitude())
                .destinationAddress(request.getDestinationAddress())
                .destLatitude(request.getDestLatitude())
                .destLongitude(request.getDestLongitude())
                .distanceKm(request.getDistanceKm())
                .estimatedDurationMin(request.getEstimatedDurationMin())
                .build();

        Ride savedRide = rideRepository.save(ride);
        RideResponse response = mapToResponse(savedRide);
        
        // Broadcast the initial SEARCHING status
        webSocketService.sendRideStatusUpdate(riderId, response);
        
        // Start background driver simulation
        simulateRideLifecycleAsync(savedRide.getId());
        
        return response;
    }

    /**
     * Get single ride details
     */
    public RideResponse getRideById(Long rideId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found: " + rideId));
        return mapToResponse(ride);
    }

    /**
     * Get rider's ride history
     */
    public List<RideResponse> getRiderRides(Long riderId) {
        return rideRepository.findByRiderIdOrderByCreatedAtDesc(riderId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Update ride status (assigns driver on ACCEPTED, debits wallet on COMPLETED)
     */
    @Transactional
    public RideResponse updateRideStatus(Long rideId, Ride.RideStatus status) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found: " + rideId));

        if (ride.getStatus() == Ride.RideStatus.COMPLETED || ride.getStatus() == Ride.RideStatus.CANCELLED) {
            throw new RuntimeException("Cannot update status of a finished ride");
        }

        ride.setStatus(status);

        // Assign a mock driver on ACCEPTED
        if (status == Ride.RideStatus.ACCEPTED) {
            ride.setAcceptedAt(LocalDateTime.now());
            // Find a driver in the DB or fall back to a mock user
            User driver = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == User.UserRole.DRIVER)
                    .findFirst()
                    .orElseGet(() -> {
                        // Create a mock driver user
                        User mockDriver = User.builder()
                                .name("Kwame Asante")
                                .phone("0249998887")
                                .password("password123")
                                .role(User.UserRole.DRIVER)
                                .avatarUrl("https://gozone.app/drivers/k_asante.jpg")
                                .build();
                        return userRepository.save(mockDriver);
                    });
            ride.setDriver(driver);
        }

        // Send push notification for status changes
        if (ride.getRider() != null) {
            String pushToken = ride.getRider().getPushToken();
            if (pushToken != null) {
                String title = "GoRide Status Update";
                String body = getRideStatusText(ride, status);
                notificationService.sendPushNotification(
                        pushToken,
                        title,
                        body,
                        java.util.Map.of("category", "ride", "rideId", rideId, "status", status.name())
                );
            }
        }

        // Set timestamps
        if (status == Ride.RideStatus.ARRIVING) {
            ride.setPickedUpAt(LocalDateTime.now()); // Simulating picked up time
        }

        // Debit rider's wallet when trip is completed
        if (status == Ride.RideStatus.COMPLETED) {
            ride.setCompletedAt(LocalDateTime.now());
            walletService.pay(
                    ride.getRider().getId(),
                    ride.getFare(),
                    Transaction.TransactionCategory.RIDE,
                    "GoRide - Trip to " + ride.getDestinationAddress()
            );
        }

        Ride updated = rideRepository.save(ride);
        RideResponse response = mapToResponse(updated);
        webSocketService.sendRideStatusUpdate(ride.getRider().getId(), response);
        return response;
    }

    private String getRideStatusText(Ride ride, Ride.RideStatus status) {
        String driverName = ride.getDriver() != null ? ride.getDriver().getName() : "Your driver";
        switch (status) {
            case SEARCHING: return "Searching for a nearby driver...";
            case ACCEPTED: return driverName + " has accepted your ride request and is heading your way.";
            case ARRIVING: return driverName + " has arrived at your pickup location.";
            case IN_PROGRESS: return "Your ride is in progress. Have a safe journey!";
            case COMPLETED: return "You have arrived at your destination. Thank you for riding with GoZone!";
            case CANCELLED: return "Your ride request was cancelled.";
            default: return status.name().toLowerCase();
        }
    }

    /**
     * Helper mapping method
     */
    private RideResponse mapToResponse(Ride ride) {
        return RideResponse.builder()
                .id(ride.getId())
                .riderId(ride.getRider().getId())
                .riderName(ride.getRider().getName())
                .driverId(ride.getDriver() != null ? ride.getDriver().getId() : null)
                .driverName(ride.getDriver() != null ? ride.getDriver().getName() : "Searching for Driver...")
                .rideType(ride.getRideType())
                .status(ride.getStatus())
                .fare(ride.getFare())
                .pickupAddress(ride.getPickupAddress())
                .pickupLatitude(ride.getPickupLatitude())
                .pickupLongitude(ride.getPickupLongitude())
                .destinationAddress(ride.getDestinationAddress())
                .destLatitude(ride.getDestLatitude())
                .destLongitude(ride.getDestLongitude())
                .distanceKm(ride.getDistanceKm())
                .estimatedDurationMin(ride.getEstimatedDurationMin())
                .createdAt(ride.getCreatedAt())
                .acceptedAt(ride.getAcceptedAt())
                .pickedUpAt(ride.getPickedUpAt())
                .completedAt(ride.getCompletedAt())
                .build();
    }

    /**
     * Simulates the ride lifecycle asynchronously in a background thread.
     */
    private void simulateRideLifecycleAsync(Long rideId) {
        java.util.concurrent.CompletableFuture.runAsync(() -> {
            try {
                // Wait for the outer database transaction to commit
                Thread.sleep(1500);

                // 1. Transition to ACCEPTED (Driver accepted request)
                updateRideStatus(rideId, Ride.RideStatus.ACCEPTED);
                Thread.sleep(3000);

                // Fetch coordinates to simulate driving route
                RideResponse ride = getRideById(rideId);
                double pickupLat = ride.getPickupLatitude() != null ? ride.getPickupLatitude() : 5.6037;
                double pickupLng = ride.getPickupLongitude() != null ? ride.getPickupLongitude() : -0.1870;
                double destLat = ride.getDestLatitude() != null ? ride.getDestLatitude() : 5.6150;
                double destLng = ride.getDestLongitude() != null ? ride.getDestLongitude() : -0.1700;
                Long riderId = ride.getRiderId();

                // 2. Simulate Driver Arriving (5 interpolation steps from a nearby offset)
                double startLat = pickupLat + 0.003;
                double startLng = pickupLng - 0.003;
                for (int i = 1; i <= 5; i++) {
                    double pct = (double) i / 5;
                    double currentLat = startLat + (pickupLat - startLat) * pct;
                    double currentLng = startLng + (pickupLng - startLng) * pct;
                    webSocketService.sendDriverLocationUpdate(riderId, rideId, currentLat, currentLng);
                    Thread.sleep(2000);
                }

                // 3. Transition to ARRIVING (Driver has arrived at pickup location)
                updateRideStatus(rideId, Ride.RideStatus.ARRIVING);
                Thread.sleep(3000);

                // 4. Transition to IN_PROGRESS (Rider has boarded)
                updateRideStatus(rideId, Ride.RideStatus.IN_PROGRESS);
                Thread.sleep(2000);

                // 5. Simulate Trip (10 interpolation steps from pickup to destination)
                for (int i = 1; i <= 10; i++) {
                    double pct = (double) i / 10;
                    double currentLat = pickupLat + (destLat - pickupLat) * pct;
                    double currentLng = pickupLng + (destLng - pickupLng) * pct;
                    webSocketService.sendDriverLocationUpdate(riderId, rideId, currentLat, currentLng);
                    Thread.sleep(2000);
                }

                // 6. Transition to COMPLETED (Arrived at destination, fare deducted)
                updateRideStatus(rideId, Ride.RideStatus.COMPLETED);

            } catch (Exception e) {
                System.err.println("Error during ride simulation: " + e.getMessage());
            }
        });
    }
}
