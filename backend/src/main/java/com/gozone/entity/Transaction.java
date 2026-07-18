package com.gozone.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * Transaction Entity — Records every wallet movement
 *
 * Types:
 *   - CREDIT: Money coming IN (top-up, refund)
 *   - DEBIT:  Money going OUT (ride, food, transfer)
 *
 * Categories describe the source/reason:
 *   - TOPUP, RIDE, FOOD, TRANSFER, WITHDRAWAL, REFUND, PAYOUT
 */
@Entity
@Table(name = "transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id", nullable = false)
    @JsonIgnore
    private Wallet wallet;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionCategory category;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private String description;

    // Reference to external payment (Paystack reference, MoMo ID, etc.)
    private String reference;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TransactionStatus status = TransactionStatus.PENDING;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // ===== Enums =====
    public enum TransactionType {
        CREDIT,  // Money IN
        DEBIT    // Money OUT
    }

    public enum TransactionCategory {
        TOPUP,       // Wallet top-up
        RIDE,        // Ride payment
        FOOD,        // Food payment
        TRANSFER,    // Send to another user
        WITHDRAWAL,  // Cash out to MoMo/Bank
        REFUND,      // Money returned
        PAYOUT       // Driver/restaurant settlement
    }

    public enum TransactionStatus {
        PENDING,
        COMPLETED,
        FAILED
    }
}
