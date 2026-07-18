package com.gozone.service;

import com.gozone.entity.*;
import com.gozone.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * WalletService — Handles SuperWallet operations
 *
 * Operations:
 *   - Get wallet balance
 *   - Get transactions history
 *   - Top up wallet (add money)
 *   - Pay for ride/food (debit wallet)
 *   - Transfer money to another user
 *   - Withdraw money to MoMo/Bank
 */
@Service
public class WalletService {

    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final PaystackService paystackService;
    private final NotificationService notificationService;

    public WalletService(WalletRepository walletRepository,
                         TransactionRepository transactionRepository,
                         UserRepository userRepository,
                         PaystackService paystackService,
                         NotificationService notificationService) {
        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.paystackService = paystackService;
        this.notificationService = notificationService;
    }

    /**
     * Get user's wallet
     */
    public Wallet getWallet(Long userId) {
        return walletRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Wallet not found for user: " + userId));
    }

    /**
     * Initialize top up payment transaction with Paystack.
     */
    public java.util.Map<String, Object> initializeTopUp(Long userId, Double amount) {
        if (amount <= 0) {
            throw new RuntimeException("Top-up amount must be greater than 0");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        String email = user.getEmail();
        if (email == null || email.trim().isEmpty()) {
            email = "kwame@gozone.com"; // fallback default email
        }
        return paystackService.initializeTransaction(email, amount);
    }

    /**
     * Top up wallet — Add money from MoMo/Card
     */
    @Transactional
    public Wallet topUp(Long userId, Double amount, String description, String reference) {
        if (amount <= 0) {
            throw new RuntimeException("Top-up amount must be greater than 0");
        }

        // Verify payment reference via Paystack gateway
        boolean isVerified = paystackService.verifyPayment(reference, amount);
        if (!isVerified) {
            throw new RuntimeException("Payment verification failed for reference: " + reference);
        }

        Wallet wallet = getWallet(userId);

        // Increase balance
        wallet.setBalance(wallet.getBalance() + amount);
        walletRepository.save(wallet);

        // Record the transaction
        Transaction txn = Transaction.builder()
                .wallet(wallet)
                .type(Transaction.TransactionType.CREDIT)
                .category(Transaction.TransactionCategory.TOPUP)
                .amount(amount)
                .description(description != null ? description : "Wallet top-up")
                .reference(reference)
                .status(Transaction.TransactionStatus.COMPLETED)
                .build();
        transactionRepository.save(txn);

        // Send push notification if token is registered
        if (wallet.getUser() != null) {
            String pushToken = wallet.getUser().getPushToken();
            if (pushToken != null) {
                notificationService.sendPushNotification(
                        pushToken,
                        "SuperWallet Top-Up Success",
                        "GH₵" + String.format("%.2f", amount) + " credited successfully via Paystack.",
                        java.util.Map.of("category", "wallet", "amount", amount)
                );
            }
        }

        return wallet;
    }

    /**
     * Debit wallet — Pay for ride or food
     */
    @Transactional
    public Transaction pay(Long userId, Double amount,
                           Transaction.TransactionCategory category,
                           String description) {
        Wallet wallet = getWallet(userId);

        // Check if user has enough balance
        if (wallet.getBalance() < amount) {
            throw new RuntimeException("Insufficient balance. Current: GH₵" + wallet.getBalance());
        }

        // Decrease balance
        wallet.setBalance(wallet.getBalance() - amount);
        walletRepository.save(wallet);

        // Record the transaction
        Transaction txn = Transaction.builder()
                .wallet(wallet)
                .type(Transaction.TransactionType.DEBIT)
                .category(category)
                .amount(amount)
                .description(description)
                .status(Transaction.TransactionStatus.COMPLETED)
                .build();
        return transactionRepository.save(txn);
    }

    /**
     * Transfer money to another user
     */
    @Transactional
    public Transaction transfer(Long senderId, String recipientPhone, Double amount, String note) {
        if (amount <= 0) {
            throw new RuntimeException("Transfer amount must be greater than 0");
        }

        Wallet senderWallet = getWallet(senderId);

        // Find recipient
        User recipient = userRepository.findByPhone(recipientPhone)
                .orElseThrow(() -> new RuntimeException("Recipient not found: " + recipientPhone));

        if (recipient.getId().equals(senderId)) {
            throw new RuntimeException("Cannot transfer to yourself");
        }

        Wallet recipientWallet = getWallet(recipient.getId());

        // Check sender balance
        if (senderWallet.getBalance() < amount) {
            throw new RuntimeException("Insufficient balance");
        }

        // Transfer money
        senderWallet.setBalance(senderWallet.getBalance() - amount);
        recipientWallet.setBalance(recipientWallet.getBalance() + amount);
        walletRepository.save(senderWallet);
        walletRepository.save(recipientWallet);

        // Record sender transaction (DEBIT)
        Transaction debitTxn = Transaction.builder()
                .wallet(senderWallet)
                .type(Transaction.TransactionType.DEBIT)
                .category(Transaction.TransactionCategory.TRANSFER)
                .amount(amount)
                .description(note != null ? note : "Transfer to " + recipient.getName())
                .status(Transaction.TransactionStatus.COMPLETED)
                .build();
        transactionRepository.save(debitTxn);

        // Record recipient transaction (CREDIT)
        Transaction creditTxn = Transaction.builder()
                .wallet(recipientWallet)
                .type(Transaction.TransactionType.CREDIT)
                .category(Transaction.TransactionCategory.TRANSFER)
                .amount(amount)
                .description(note != null ? note : "Transfer from " + senderWallet.getUser().getName())
                .status(Transaction.TransactionStatus.COMPLETED)
                .build();
        transactionRepository.save(creditTxn);

        return debitTxn;
    }

    /**
     * Get transaction history
     */
    public List<Transaction> getTransactions(Long userId) {
        Wallet wallet = getWallet(userId);
        return transactionRepository.findByWalletIdOrderByCreatedAtDesc(wallet.getId());
    }

    /**
     * Get transactions filtered by type (CREDIT or DEBIT)
     */
    public List<Transaction> getTransactionsByType(Long userId, Transaction.TransactionType type) {
        Wallet wallet = getWallet(userId);
        return transactionRepository.findByWalletIdAndTypeOrderByCreatedAtDesc(wallet.getId(), type);
    }
}
