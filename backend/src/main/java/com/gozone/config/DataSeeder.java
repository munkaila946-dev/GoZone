package com.gozone.config;

import com.gozone.entity.*;
import com.gozone.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * DataSeeder — Inserts sample data when the app starts
 *
 * This creates test users, restaurants, and menu items so you
 * can immediately test the API without manually adding data.
 *
 * Runs automatically every time the app starts (if DB is empty).
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final RestaurantRepository restaurantRepository;
    private final MenuItemRepository menuItemRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository,
                      WalletRepository walletRepository,
                      RestaurantRepository restaurantRepository,
                      MenuItemRepository menuItemRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.walletRepository = walletRepository;
        this.restaurantRepository = restaurantRepository;
        this.menuItemRepository = menuItemRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Only seed if no restaurants exist yet
        if (restaurantRepository.count() > 0) {
            return;
        }

        System.out.println("🌱 Seeding initial data...");

        // ===== Create Test User =====
        User testUser = User.builder()
                .name("Kwame Mensah")
                .phone("0241234567")
                .email("kwame@example.com")
                .password(passwordEncoder.encode("password123"))
                .role(User.UserRole.CUSTOMER)
                .isActive(true)
                .build();
        testUser = userRepository.save(testUser);

        Wallet wallet = Wallet.builder()
                .user(testUser)
                .balance(1250.00)
                .currency("GHS")
                .isActive(true)
                .build();
        walletRepository.save(wallet);

        // ===== Create Restaurants =====
        Restaurant papaye = Restaurant.builder()
                .name("Papaye Fast Foods")
                .description("Best grilled chicken in Accra")
                .tagline("Chicken • Grills • Local")
                .cuisineType("Chicken")
                .rating(4.5)
                .ratingCount(320)
                .deliveryTimeMin(25)
                .deliveryTimeMax(30)
                .deliveryFee(5.0)
                .isOpen(true)
                .address("Oxford Street, Osu, Accra")
                .build();
        papaye = restaurantRepository.save(papaye);

        Restaurant pizzaHut = Restaurant.builder()
                .name("Pizza Hut")
                .description("Fresh pizzas, pastas, and more")
                .tagline("Pizza • Italian • Pasta")
                .cuisineType("Pizza")
                .rating(4.3)
                .ratingCount(180)
                .deliveryTimeMin(30)
                .deliveryTimeMax(40)
                .deliveryFee(0.0)
                .isOpen(true)
                .address("Accra Mall, Teshie Road")
                .build();
        pizzaHut = restaurantRepository.save(pizzaHut);

        Restaurant kfc = Restaurant.builder()
                .name("KFC - Osu")
                .description("World famous fried chicken")
                .tagline("Fried Chicken • Fast Food")
                .cuisineType("Chicken")
                .rating(4.6)
                .ratingCount(450)
                .deliveryTimeMin(20)
                .deliveryTimeMax(30)
                .deliveryFee(6.0)
                .isOpen(false)
                .address("Oxford Street, Osu")
                .build();
        kfc = restaurantRepository.save(kfc);

        // ===== Create Menu Items for Papaye =====
        menuItemRepository.saveAll(List.of(
                MenuItem.builder().restaurant(papaye).name("Jollof Rice & Chicken").description("Smoky jollof rice with grilled chicken").price(35.0).category("Popular").isPopular(true).isAvailable(true).build(),
                MenuItem.builder().restaurant(papaye).name("Fried Rice & Chicken").description("Special fried rice with crispy chicken").price(38.0).category("Popular").isPopular(true).isAvailable(true).build(),
                MenuItem.builder().restaurant(papaye).name("Grilled Chicken (Quarter)").description("Marinated and flame-grilled to perfection").price(30.0).category("Grills").isAvailable(true).build(),
                MenuItem.builder().restaurant(papaye).name("Grilled Chicken (Half)").description("Half chicken with pepper sauce").price(55.0).category("Grills").isAvailable(true).build(),
                MenuItem.builder().restaurant(papaye).name("Grilled Tilapia").description("Fresh tilapia grilled with spices").price(65.0).category("Grills").isAvailable(true).build(),
                MenuItem.builder().restaurant(papaye).name("Plantain (3 pcs)").description("Golden fried plantain").price(12.0).category("Sides").isAvailable(true).build(),
                MenuItem.builder().restaurant(papaye).name("Salad Bowl").description("Fresh garden salad with dressing").price(15.0).category("Sides").isAvailable(true).build(),
                MenuItem.builder().restaurant(papaye).name("Shito (Pepper Sauce)").description("Spicy Ghanaian black pepper sauce").price(5.0).category("Sides").isAvailable(true).build()
        ));

        // ===== Create Menu Items for Pizza Hut =====
        menuItemRepository.saveAll(List.of(
                MenuItem.builder().restaurant(pizzaHut).name("Pepperoni Large").description("Loaded with pepperoni and mozzarella").price(85.0).category("Popular").isPopular(true).isAvailable(true).build(),
                MenuItem.builder().restaurant(pizzaHut).name("Margherita Large").description("Classic tomato, basil, and mozzarella").price(75.0).category("Popular").isPopular(true).isAvailable(true).build(),
                MenuItem.builder().restaurant(pizzaHut).name("Chicken BBQ Large").description("BBQ chicken, onions, and peppers").price(95.0).category("Specialty").isAvailable(true).build(),
                MenuItem.builder().restaurant(pizzaHut).name("Meat Lovers Large").description("Pepperoni, beef, sausage, and bacon").price(105.0).category("Specialty").isAvailable(true).build()
        ));

        System.out.println("✅ Data seeding complete!");
        System.out.println("   📧 Test user: kwame@example.com");
        System.out.println("   📱 Test phone: 0241234567");
        System.out.println("   🔑 Test password: password123");
        System.out.println("   💰 Wallet balance: GH₵1,250.00");
    }
}
