package com.gozone.service;

import com.gozone.dto.OrderDtos.*;
import com.gozone.entity.*;
import com.gozone.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final RestaurantRepository restaurantRepository;
    private final MenuItemRepository menuItemRepository;
    private final UserRepository userRepository;
    private final WalletService walletService;
    private final WebSocketService webSocketService;
    private final NotificationService notificationService;

    public OrderService(OrderRepository orderRepository,
                        RestaurantRepository restaurantRepository,
                        MenuItemRepository menuItemRepository,
                        UserRepository userRepository,
                        WalletService walletService,
                        WebSocketService webSocketService,
                        NotificationService notificationService) {
        this.orderRepository = orderRepository;
        this.restaurantRepository = restaurantRepository;
        this.menuItemRepository = menuItemRepository;
        this.userRepository = userRepository;
        this.walletService = walletService;
        this.webSocketService = webSocketService;
        this.notificationService = notificationService;
    }

    /**
     * Create food order and debit wallet
     */
    @Transactional
    public OrderResponse createOrder(Long userId, OrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                .orElseThrow(() -> new RuntimeException("Restaurant not found: " + request.getRestaurantId()));

        // Pay for the order via SuperWallet
        walletService.pay(
                userId, 
                request.getTotal(), 
                Transaction.TransactionCategory.FOOD, 
                "GoBite - " + restaurant.getName()
        );

        // Build Order
        Order order = Order.builder()
                .user(user)
                .restaurant(restaurant)
                .orderType(request.getOrderType())
                .subtotal(request.getSubtotal())
                .deliveryFee(request.getDeliveryFee() != null ? request.getDeliveryFee() : 0.0)
                .serviceFee(request.getServiceFee() != null ? request.getServiceFee() : 2.0)
                .total(request.getTotal())
                .deliveryAddress(request.getDeliveryAddress())
                .deliveryInstructions(request.getDeliveryInstructions())
                .status(Order.OrderStatus.PLACED)
                .build();

        // Save order first to get its ID
        Order savedOrder = orderRepository.save(order);

        // Add Order Items
        List<OrderItem> orderItems = new ArrayList<>();
        for (OrderItemRequest itemReq : request.getItems()) {
            MenuItem menuItem = menuItemRepository.findById(itemReq.getMenuItemId())
                    .orElseThrow(() -> new RuntimeException("Menu item not found: " + itemReq.getMenuItemId()));

            OrderItem orderItem = OrderItem.builder()
                    .order(savedOrder)
                    .menuItem(menuItem)
                    .quantity(itemReq.getQuantity())
                    .price(itemReq.getPrice())
                    .build();
            orderItems.add(orderItem);
        }
        savedOrder.setOrderItems(orderItems);
        Order saved = orderRepository.save(savedOrder);

        OrderResponse response = mapToResponse(saved);
        // Broadcast the initial PLACED status
        webSocketService.sendOrderStatusUpdate(userId, response);

        // Start background order simulation
        simulateOrderLifecycleAsync(saved.getId());

        return response;
    }

    /**
     * Get single order response
     */
    public OrderResponse getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
        return mapToResponse(order);
    }

    /**
     * Get user's order history
     */
    public List<OrderResponse> getUserOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Update order status (with auto-refund on CANCELLED)
     */
    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, Order.OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        if (order.getStatus() == Order.OrderStatus.CANCELLED || order.getStatus() == Order.OrderStatus.DELIVERED) {
            throw new RuntimeException("Cannot update status of a finalized order");
        }

        order.setStatus(status);

        // Send push notification for status changes
        if (order.getUser() != null) {
            String pushToken = order.getUser().getPushToken();
            if (pushToken != null) {
                String title = "GoBite Order Status";
                String body = "Your order from " + order.getRestaurant().getName() + " is now " + getStatusText(status) + ".";
                notificationService.sendPushNotification(
                        pushToken,
                        title,
                        body,
                        java.util.Map.of("category", "food", "orderId", orderId, "status", status.name())
                );
            }
        }

        // Handle auto-refund if cancelled
        if (status == Order.OrderStatus.CANCELLED) {
            walletService.topUp(
                    order.getUser().getId(),
                    order.getTotal(),
                    "Refund - GoBite order #" + orderId,
                    "REFUND_" + orderId
            );
        }

        Order updated = orderRepository.save(order);
        OrderResponse response = mapToResponse(updated);
        webSocketService.sendOrderStatusUpdate(order.getUser().getId(), response);
        return response;
    }

    private String getStatusText(Order.OrderStatus status) {
        switch (status) {
            case PLACED: return "Placed";
            case PREPARING: return "Preparing";
            case READY: return "Ready for pickup";
            case PICKED_UP: return "On the way / Picked up";
            case DELIVERED: return "Delivered";
            case CANCELLED: return "Cancelled";
            default: return status.name().toLowerCase();
        }
    }

    /**
     * Mapping helper
     */
    private OrderResponse mapToResponse(Order order) {
        List<OrderItemResponse> itemResponses = new ArrayList<>();
        if (order.getOrderItems() != null) {
            itemResponses = order.getOrderItems().stream().map(item -> 
                OrderItemResponse.builder()
                        .menuItemId(item.getMenuItem().getId())
                        .menuItemName(item.getMenuItem().getName())
                        .quantity(item.getQuantity())
                        .price(item.getPrice())
                        .lineTotal(item.getLineTotal())
                        .build()
            ).collect(Collectors.toList());
        }

        return OrderResponse.builder()
                .id(order.getId())
                .restaurantId(order.getRestaurant().getId())
                .restaurantName(order.getRestaurant().getName())
                .orderType(order.getOrderType())
                .status(order.getStatus())
                .subtotal(order.getSubtotal())
                .deliveryFee(order.getDeliveryFee())
                .serviceFee(order.getServiceFee())
                .total(order.getTotal())
                .deliveryAddress(order.getDeliveryAddress())
                .items(itemResponses)
                .createdAt(order.getCreatedAt())
                .build();
    }

    /**
     * Simulates the food order progression asynchronously.
     */
    private void simulateOrderLifecycleAsync(Long orderId) {
        java.util.concurrent.CompletableFuture.runAsync(() -> {
            try {
                // Wait for the database transaction to commit
                Thread.sleep(1500);

                // PLACED -> PREPARING
                updateOrderStatus(orderId, Order.OrderStatus.PREPARING);
                Thread.sleep(3000);

                // PREPARING -> READY
                updateOrderStatus(orderId, Order.OrderStatus.READY);
                Thread.sleep(3000);

                // READY -> PICKED_UP
                updateOrderStatus(orderId, Order.OrderStatus.PICKED_UP);
                Thread.sleep(4000);

                // PICKED_UP -> DELIVERED
                updateOrderStatus(orderId, Order.OrderStatus.DELIVERED);

            } catch (Exception e) {
                System.err.println("Error during order simulation: " + e.getMessage());
            }
        });
    }
}
