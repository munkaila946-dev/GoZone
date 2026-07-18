package com.gozone.controller;

import com.gozone.dto.ApiResponse;
import com.gozone.entity.MenuItem;
import com.gozone.entity.Restaurant;
import com.gozone.repository.MenuItemRepository;
import com.gozone.repository.RestaurantRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * RestaurantController — GoBite restaurant & menu endpoints
 *
 * These are public endpoints (no auth required for browsing).
 *
 * Endpoints:
 *   GET /api/restaurants              → List all restaurants
 *   GET /api/restaurants/{id}         → Get one restaurant
 *   GET /api/restaurants/{id}/menu    → Get full menu for a restaurant
 */
@RestController
@RequestMapping("/api/restaurants")
public class RestaurantController {

    private final RestaurantRepository restaurantRepository;
    private final MenuItemRepository menuItemRepository;

    public RestaurantController(RestaurantRepository restaurantRepository,
                                MenuItemRepository menuItemRepository) {
        this.restaurantRepository = restaurantRepository;
        this.menuItemRepository = menuItemRepository;
    }

    /**
     * Get all restaurants
     * GET /api/restaurants
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Restaurant>>> getAllRestaurants() {
        List<Restaurant> restaurants = restaurantRepository.findAll();
        return ResponseEntity.ok(
                ApiResponse.success("Restaurants retrieved", restaurants)
        );
    }

    /**
     * Get open restaurants only
     * GET /api/restaurants/open
     */
    @GetMapping("/open")
    public ResponseEntity<ApiResponse<List<Restaurant>>> getOpenRestaurants() {
        List<Restaurant> restaurants = restaurantRepository.findByIsOpenTrue();
        return ResponseEntity.ok(
                ApiResponse.success("Open restaurants retrieved", restaurants)
        );
    }

    /**
     * Get a single restaurant by ID
     * GET /api/restaurants/1
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Restaurant>> getRestaurant(@PathVariable Long id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant not found: " + id));
        return ResponseEntity.ok(
                ApiResponse.success("Restaurant retrieved", restaurant)
        );
    }

    /**
     * Get the full menu for a restaurant
     * GET /api/restaurants/1/menu
     */
    @GetMapping("/{id}/menu")
    public ResponseEntity<ApiResponse<List<MenuItem>>> getMenu(@PathVariable Long id) {
        // Verify restaurant exists
        restaurantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant not found: " + id));

        List<MenuItem> menu = menuItemRepository.findByRestaurantId(id);
        return ResponseEntity.ok(
                ApiResponse.success("Menu retrieved", menu)
        );
    }
}
