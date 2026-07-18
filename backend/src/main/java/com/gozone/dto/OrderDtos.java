package com.gozone.dto;

import com.gozone.entity.Order;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

public class OrderDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderRequest {
        private Long restaurantId;
        private Order.OrderType orderType;
        private Double subtotal;
        private Double deliveryFee;
        private Double serviceFee;
        private Double total;
        private String deliveryAddress;
        private String deliveryInstructions;
        private List<OrderItemRequest> items;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemRequest {
        private Long menuItemId;
        private Integer quantity;
        private Double price;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderResponse {
        private Long id;
        private Long restaurantId;
        private String restaurantName;
        private Order.OrderType orderType;
        private Order.OrderStatus status;
        private Double subtotal;
        private Double deliveryFee;
        private Double serviceFee;
        private Double total;
        private String deliveryAddress;
        private List<OrderItemResponse> items;
        private LocalDateTime createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderItemResponse {
        private Long menuItemId;
        private String menuItemName;
        private Integer quantity;
        private Double price;
        private Double lineTotal;
    }
}
