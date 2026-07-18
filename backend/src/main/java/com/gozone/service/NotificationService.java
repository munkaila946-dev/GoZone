package com.gozone.service;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class NotificationService {

    private final RestTemplate restTemplate;

    public NotificationService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Send push notification using Expo Push Notification API.
     */
    public void sendPushNotification(String expoPushToken, String title, String body, Map<String, Object> data) {
        if (expoPushToken == null || expoPushToken.trim().isEmpty() || expoPushToken.startsWith("mock_") || !expoPushToken.contains("ExponentPushToken")) {
            System.out.println("Skipping Expo push notification: Token is null or mock (" + expoPushToken + ")");
            return;
        }

        try {
            String url = "https://exp.host/--/api/v2/push/send";

            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");

            Map<String, Object> payload = Map.of(
                    "to", expoPushToken,
                    "title", title,
                    "body", body,
                    "data", data != null ? data : Map.of()
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);

            if (!response.getStatusCode().is2xxSuccessful()) {
                System.err.println("Failed to send push notification. Status code: " + response.getStatusCode());
            } else {
                System.out.println("Expo push notification sent successfully to " + expoPushToken);
            }
        } catch (Exception e) {
            System.err.println("Error sending Expo push notification: " + e.getMessage());
        }
    }
}
