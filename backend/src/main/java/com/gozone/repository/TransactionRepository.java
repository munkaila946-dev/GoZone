package com.gozone.repository;

import com.gozone.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    // Get all transactions for a wallet, newest first
    List<Transaction> findByWalletIdOrderByCreatedAtDesc(Long walletId);

    // Get transactions by type (CREDIT or DEBIT)
    List<Transaction> findByWalletIdAndTypeOrderByCreatedAtDesc(Long walletId, Transaction.TransactionType type);
}
