package com.gozone.repository;

import com.gozone.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // Get all orders for a user, newest first
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Get all orders for a restaurant, newest first
    List<Order> findByRestaurantIdOrderByCreatedAtDesc(Long restaurantId);
}
