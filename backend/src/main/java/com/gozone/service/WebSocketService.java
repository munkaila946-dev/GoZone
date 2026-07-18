package com.gozone.service;

import com.gozone.config.UserWebSocketHandler;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class WebSocketService {

    private final UserWebSocketHandler webSocketHandler;

    public WebSocketService(UserWebSocketHandler webSocketHandler) {
        this.webSocketHandler = webSocketHandler;
    }

    /**
     * Send general ride status transitions (e.g. searching -> accepted).
     */
    public void sendRideStatusUpdate(Long userId, Object rideResponse) {
        webSocketHandler.sendMessageToUser(userId, Map.of(
            "type", "RIDE_STATUS_UPDATE",
            "data", rideResponse
        ));
    }

    /**
     * Send driver location GPS coordinate updates.
     */
    public void sendDriverLocationUpdate(Long userId, Long rideId, double latitude, double longitude) {
        webSocketHandler.sendMessageToUser(userId, Map.of(
            "type", "DRIVER_LOCATION_UPDATE",
            "rideId", rideId,
            "latitude", latitude,
            "longitude", longitude
        ));
    }

    /**
     * Send general food order status transitions.
     */
    public void sendOrderStatusUpdate(Long userId, Object orderResponse) {
        webSocketHandler.sendMessageToUser(userId, Map.of(
            "type", "ORDER_STATUS_UPDATE",
            "data", orderResponse
        ));
    }
}
