package com.gozone.repository;

import com.gozone.entity.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, Long> {

    // Find wallet by user ID
    Optional<Wallet> findByUserId(Long userId);
}
