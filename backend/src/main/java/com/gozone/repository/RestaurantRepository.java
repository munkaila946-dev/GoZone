package com.gozone.repository;

import com.gozone.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {

    // Get all open restaurants
    List<Restaurant> findByIsOpenTrue();

    // Get restaurants by cuisine type
    List<Restaurant> findByCuisineTypeContainingIgnoreCase(String cuisine);
}
