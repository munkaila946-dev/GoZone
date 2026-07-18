package com.gozone.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Order Entity — Food orders from GoBite
 *
 * Order Types:
 *   - DELIVERY: Food delivered to customer
 *   - PICKUP:   Customer picks up from restaurant
 *   - DINE_IN:  Customer eats at restaurant (walk-in queue)
 *
 * Order Flow:
 *   PLACED → PREPARING → READY → (PICKED_UP) → DELIVERED
 */
@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderType orderType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private OrderStatus status = OrderStatus.PLACED;

    @Column(nullable = false)
    private Double subtotal;

    @Column(nullable = false)
    @Builder.Default
    private Double deliveryFee = 0.0;

    @Column(nullable = false)
    @Builder.Default
    private Double serviceFee = 2.0;

    @Column(nullable = false)
    private Double total;

    // Delivery details
    private String deliveryAddress;
    private String deliveryInstructions;

    // Rider assignment (for delivery orders)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rider_id")
    private User rider;

    // ===== Relationship: One Order → Many Order Items =====
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderItem> orderItems;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // ===== Enums =====
    public enum OrderType {
        DELIVERY,
        PICKUP,
        DINE_IN
    }

    public enum OrderStatus {
        PLACED,      // Order received
        PREPARING,   // Restaurant is cooking
        READY,       // Food is ready
        PICKED_UP,   // Rider has picked up
        DELIVERED,   // Customer received food
        CANCELLED    // Order was cancelled
    }
}
