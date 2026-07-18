package com.gozone.repository;

import com.gozone.entity.Ride;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RideRepository extends JpaRepository<Ride, Long> {

    // Get all rides for a user (rider), newest first
    List<Ride> findByRiderIdOrderByCreatedAtDesc(Long riderId);

    // Get rides by status (e.g., all SEARCHING rides)
    List<Ride> findByStatus(Ride.RideStatus status);
}
