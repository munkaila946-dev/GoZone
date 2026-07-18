package com.gozone.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Restaurant Entity — GoBite restaurant directory
 */
@Entity
@Table(name = "restaurants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Restaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    private String tagline;

    // e.g., "Chicken • Grills • Local"
    private String cuisineType;

    private String imageUrl;

    @Column(nullable = false)
    @Builder.Default
    private Double rating = 0.0;

    @Column(nullable = false)
    @Builder.Default
    private Integer ratingCount = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer deliveryTimeMin = 30;

    @Column(nullable = false)
    @Builder.Default
    private Integer deliveryTimeMax = 45;

    @Column(nullable = false)
    @Builder.Default
    private Double deliveryFee = 5.0;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isOpen = true;

    // Address
    private String address;

    private Double latitude;
    private Double longitude;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // ===== Relationship: One Restaurant → Many Menu Items =====
    @OneToMany(mappedBy = "restaurant", cascade = CascadeType.ALL)
    private List<MenuItem> menuItems;

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
}
