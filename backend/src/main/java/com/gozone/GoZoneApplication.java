package com.gozone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * GoZone Backend Application — Main Entry Point
 *
 * This is a super-app backend serving three pillars:
 *   1. GoRide     — Ride-hailing APIs
 *   2. GoBite     — Food ordering APIs
 *   3. SuperWallet — Wallet & payment APIs
 *
 * Run this class to start the server (default: http://localhost:8080)
 */
@SpringBootApplication
public class GoZoneApplication {

    public static void main(String[] args) {
        SpringApplication.run(GoZoneApplication.class, args);
    }
}
