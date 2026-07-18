package com.gozone.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * JwtAuthFilter — Intercepts every request and checks for JWT token
 *
 * Flow:
 *   1. Extract token from "Authorization: Bearer <token>" header
 *   2. Validate the token
 *   3. If valid, set the user as authenticated in Spring Security
 *   4. Continue the request
 */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        // 1. Get the Authorization header
        String authHeader = request.getHeader("Authorization");

        // 2. Check if header exists and starts with "Bearer "
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            // Fallback for local development/testing: auto-authenticate as User ID 1 (Kwame Mensah)
            UsernamePasswordAuthenticationToken mockToken =
                    new UsernamePasswordAuthenticationToken(
                            1L,
                            null,
                            List.of(new SimpleGrantedAuthority("ROLE_USER"))
                    );
            mockToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(mockToken);
            
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Extract the token (remove "Bearer " prefix)
        String token = authHeader.substring(7);

        // 4. Validate and process the token
        try {
            if (jwtService.isTokenValid(token)) {
                // Extract user info from token
                Long userId = jwtService.extractUserId(token);
                String phone = jwtService.extractPhone(token);

                // Create authentication object
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userId,
                                null,
                                List.of(new SimpleGrantedAuthority("ROLE_USER"))
                        );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // Set the authenticated user in Spring Security context
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        } catch (Exception e) {
            logger.error("JWT validation failed", e);
        }

        // 5. Continue the filter chain
        filterChain.doFilter(request, response);
    }
}
