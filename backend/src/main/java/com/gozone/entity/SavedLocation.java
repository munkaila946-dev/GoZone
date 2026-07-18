package com.gozone.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * SavedLocation Entity — User's saved addresses (Home, Work, etc.)
 */
@Entity
@Table(name = "saved_locations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavedLocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(nullable = false)
    private String label;   // "Home", "Work", "Girlfriend's House"

    @Column(nullable = false)
    private String address;

    private Double latitude;
    private Double longitude;
}
