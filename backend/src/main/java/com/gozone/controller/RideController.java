package com.gozone.controller;

import com.gozone.dto.ApiResponse;
import com.gozone.dto.RideDtos.*;
import com.gozone.entity.Ride;
import com.gozone.service.RideService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rides")
public class RideController {

    private final RideService rideService;

    public RideController(RideService rideService) {
        this.rideService = rideService;
    }

    /**
     * Book a ride
     * POST /api/rides
     */
    @PostMapping
    public ResponseEntity<ApiResponse<RideResponse>> bookRide(
            Authentication authentication,
            @RequestBody RideRequest request
    ) {
        Long riderId = (Long) authentication.getPrincipal();
        RideResponse response = rideService.requestRide(riderId, request);
        return ResponseEntity.ok(
                ApiResponse.success("Ride requested successfully", response)
        );
    }

    /**
     * Get rider's trip history
     * GET /api/rides
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<RideResponse>>> getRiderRides(Authentication authentication) {
        Long riderId = (Long) authentication.getPrincipal();
        List<RideResponse> response = rideService.getRiderRides(riderId);
        return ResponseEntity.ok(
                ApiResponse.success("Trip history retrieved", response)
        );
    }

    /**
     * Get ride details
     * GET /api/rides/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RideResponse>> getRideById(
            Authentication authentication,
            @PathVariable Long id
    ) {
        RideResponse response = rideService.getRideById(id);
        return ResponseEntity.ok(
                ApiResponse.success("Ride details retrieved", response)
        );
    }

    /**
     * Update ride status
     * PUT /api/rides/{id}/status
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<RideResponse>> updateStatus(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        String statusStr = body.get("status");
        Ride.RideStatus status = Ride.RideStatus.valueOf(statusStr.toUpperCase());
        RideResponse response = rideService.updateRideStatus(id, status);
        return ResponseEntity.ok(
                ApiResponse.success("Ride status updated to " + statusStr, response)
        );
    }
}
