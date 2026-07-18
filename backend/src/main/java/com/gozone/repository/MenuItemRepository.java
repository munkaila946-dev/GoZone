package com.gozone.repository;

import com.gozone.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {

    // Get all menu items for a restaurant
    List<MenuItem> findByRestaurantId(Long restaurantId);

    // Get popular items for a restaurant
    List<MenuItem> findByRestaurantIdAndIsPopularTrue(Long restaurantId);

    // Get items by category within a restaurant
    List<MenuItem> findByRestaurantIdAndCategory(Long restaurantId, String category);
}
