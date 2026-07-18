package com.gozone.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.net.URI;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class UserWebSocketHandler extends TextWebSocketHandler {

    private static final Logger log = LoggerFactory.getLogger(UserWebSocketHandler.class);
    
    // Map of active user sessions: userId -> WebSocketSession
    private static final Map<Long, WebSocketSession> userSessions = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        Long userId = getUserIdFromSession(session);
        if (userId != null) {
            userSessions.put(userId, session);
            log.info("WebSocket connection established for user ID: {}, session: {}", userId, session.getId());
            
            // Send connection success acknowledgement
            sendMessageToUser(userId, Map.of(
                "type", "CONNECTION_SUCCESS", 
                "message", "Connected to GoZone real-time updates"
            ));
        } else {
            log.warn("WebSocket connection established but no valid userId found. Closing session: {}", session.getId());
            session.close(CloseStatus.BAD_DATA);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        Long userId = getUserIdFromSession(session);
        if (userId != null) {
            userSessions.remove(userId);
            log.info("WebSocket connection closed for user ID: {}, status: {}", userId, status);
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        log.info("Received WebSocket message: {}", message.getPayload());
        // For bidirectional needs later, parse client commands here.
    }

    /**
     * Send structured JSON payload to a specific user's active session.
     */
    public void sendMessageToUser(Long userId, Object payload) {
        WebSocketSession session = userSessions.get(userId);
        if (session != null && session.isOpen()) {
            try {
                String json = objectMapper.writeValueAsString(payload);
                session.sendMessage(new TextMessage(json));
            } catch (IOException e) {
                log.error("Failed to send WebSocket message to user ID: {}", userId, e);
            }
        } else {
            log.debug("Session not found or closed for user ID: {}, message dropped.", userId);
        }
    }

    private Long getUserIdFromSession(WebSocketSession session) {
        URI uri = session.getUri();
        if (uri == null) return null;
        String query = uri.getQuery();
        if (query == null) return null;
        
        for (String param : query.split("&")) {
            String[] pair = param.split("=");
            if (pair.length == 2 && (pair[0].equalsIgnoreCase("userId") || pair[0].equalsIgnoreCase("user"))) {
                try {
                    return Long.parseLong(pair[1]);
                } catch (NumberFormatException e) {
                    return null;
                }
            }
        }
        return null;
    }
}
