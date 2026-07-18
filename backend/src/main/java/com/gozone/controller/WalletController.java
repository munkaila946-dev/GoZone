package com.gozone.controller;

import com.gozone.dto.ApiResponse;
import com.gozone.entity.Transaction;
import com.gozone.entity.Wallet;
import com.gozone.service.WalletService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;
import java.util.Map;

/**
 * WalletController — SuperWallet endpoints
 *
 * All endpoints require authentication (JWT token).
 *
 * Endpoints:
 *   GET  /api/wallet                    → Get wallet balance
 *   GET  /api/wallet/transactions        → Get transaction history
 *   GET  /api/wallet/transactions/{type} → Filter by CREDIT or DEBIT
 *   POST /api/wallet/topup              → Top up wallet
 *   POST /api/wallet/transfer           → Send money to another user
 */
@RestController
@RequestMapping("/api/wallet")
public class WalletController {

    private final WalletService walletService;

    public WalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    /**
     * Get wallet balance
     * GET /api/wallet
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Wallet>> getWallet(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        Wallet wallet = walletService.getWallet(userId);
        return ResponseEntity.ok(
                ApiResponse.success("Wallet retrieved", wallet)
        );
    }

    /**
     * Get all transactions
     * GET /api/wallet/transactions
     */
    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<List<Transaction>>> getTransactions(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        List<Transaction> transactions = walletService.getTransactions(userId);
        return ResponseEntity.ok(
                ApiResponse.success("Transactions retrieved", transactions)
        );
    }

    /**
     * Get transactions filtered by type
     * GET /api/wallet/transactions/type/CREDIT
     * GET /api/wallet/transactions/type/DEBIT
     */
    @GetMapping("/transactions/type/{type}")
    public ResponseEntity<ApiResponse<List<Transaction>>> getTransactionsByType(
            Authentication authentication,
            @PathVariable Transaction.TransactionType type
    ) {
        Long userId = (Long) authentication.getPrincipal();
        List<Transaction> transactions = walletService.getTransactionsByType(userId, type);
        return ResponseEntity.ok(
                ApiResponse.success("Transactions retrieved", transactions)
        );
    }

    /**
     * Initialize top-up transaction
     * POST /api/wallet/initialize-topup
     * Body: { "amount": 100 }
     */
    @PostMapping("/initialize-topup")
    public ResponseEntity<ApiResponse<Map<String, Object>>> initializeTopUp(
            Authentication authentication,
            @RequestBody Map<String, Object> body,
            HttpServletRequest request
    ) {
        Long userId = (Long) authentication.getPrincipal();
        Double amount = ((Number) body.get("amount")).doubleValue();

        Map<String, Object> responseData = walletService.initializeTopUp(userId, amount);

        // Prepend host to relative URLs returned for mock setup
        Map<String, Object> data = (Map<String, Object>) responseData.get("data");
        if (data != null) {
            String url = (String) data.get("authorization_url");
            if (url != null && url.startsWith("/")) {
                String baseUrl = request.getRequestURL().toString().replace(request.getRequestURI(), "");
                String dynamicUrl = baseUrl + url;
                
                Map<String, Object> mutableData = new java.util.HashMap<>(data);
                mutableData.put("authorization_url", dynamicUrl);
                
                Map<String, Object> mutableResponse = new java.util.HashMap<>(responseData);
                mutableResponse.put("data", mutableData);
                responseData = mutableResponse;
            }
        }

        return ResponseEntity.ok(
                ApiResponse.success("Top-up transaction initialized successfully", responseData)
        );
    }

    /**
     * Top up wallet
     * POST /api/wallet/topup
     * Body: { "amount": 100, "description": "MTN MoMo", "reference": "PSK_12345" }
     */
    @PostMapping("/topup")
    public ResponseEntity<ApiResponse<Wallet>> topUp(
            Authentication authentication,
            @RequestBody Map<String, Object> body
    ) {
        Long userId = (Long) authentication.getPrincipal();
        Double amount = ((Number) body.get("amount")).doubleValue();
        String description = (String) body.get("description");
        String reference = (String) body.get("reference");

        Wallet wallet = walletService.topUp(userId, amount, description, reference);
        return ResponseEntity.ok(
                ApiResponse.success("Top-up successful! New balance: GH₵" + wallet.getBalance(), wallet)
        );
    }

    /**
     * Transfer money to another user
     * POST /api/wallet/transfer
     * Body: { "recipientPhone": "+233241234567", "amount": 50, "note": "Lunch money" }
     */
    @PostMapping("/transfer")
    public ResponseEntity<ApiResponse<Transaction>> transfer(
            Authentication authentication,
            @RequestBody Map<String, Object> body
    ) {
        Long userId = (Long) authentication.getPrincipal();
        String recipientPhone = (String) body.get("recipientPhone");
        Double amount = ((Number) body.get("amount")).doubleValue();
        String note = (String) body.get("note");

        Transaction txn = walletService.transfer(userId, recipientPhone, amount, note);
        return ResponseEntity.ok(
                ApiResponse.success("Transfer successful!", txn)
        );
    }
}
