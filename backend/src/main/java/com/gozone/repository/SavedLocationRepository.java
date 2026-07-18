package com.gozone.repository;

import com.gozone.entity.SavedLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SavedLocationRepository extends JpaRepository<SavedLocation, Long> {

    // Get all saved locations for a user
    List<SavedLocation> findByUserId(Long userId);
}
