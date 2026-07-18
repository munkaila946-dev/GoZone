package com.gozone.controller;

import com.gozone.dto.ApiResponse;
import com.gozone.dto.OrderDtos.*;
import com.gozone.entity.Order;
import com.gozone.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    /**
     * Create food order
     * POST /api/orders
     */
    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            Authentication authentication,
            @RequestBody OrderRequest request
    ) {
        Long userId = (Long) authentication.getPrincipal();
        OrderResponse response = orderService.createOrder(userId, request);
        return ResponseEntity.ok(
                ApiResponse.success("Order placed successfully", response)
        );
    }

    /**
     * Get user's order history
     * GET /api/orders
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getUserOrders(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        List<OrderResponse> response = orderService.getUserOrders(userId);
        return ResponseEntity.ok(
                ApiResponse.success("Order history retrieved", response)
        );
    }

    /**
     * Get order details by ID
     * GET /api/orders/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(
            Authentication authentication,
            @PathVariable Long id
    ) {
        OrderResponse response = orderService.getOrderById(id);
        return ResponseEntity.ok(
                ApiResponse.success("Order retrieved", response)
        );
    }

    /**
     * Update order status
     * PUT /api/orders/{id}/status
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateStatus(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        String statusStr = body.get("status");
        Order.OrderStatus status = Order.OrderStatus.valueOf(statusStr.toUpperCase());
        OrderResponse response = orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(
                ApiResponse.success("Order status updated to " + statusStr, response)
        );
    }
}
