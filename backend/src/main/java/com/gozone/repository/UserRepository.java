package com.gozone.repository;

import com.gozone.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * UserRepository — Database access for User entities
 *
 * Spring Data JPA auto-generates the SQL queries for us!
 * We just define method names and it figures out the query.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Find user by phone number (used for login)
    Optional<User> findByPhone(String phone);

    // Find user by email
    Optional<User> findByEmail(String email);

    // Check if phone number already exists (for registration validation)
    boolean existsByPhone(String phone);

    // Check if email already exists
    boolean existsByEmail(String email);
}
