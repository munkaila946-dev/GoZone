package com.gozone.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping("/api/public/mock-checkout")
public class MockCheckoutController {

    @GetMapping(produces = MediaType.TEXT_HTML_VALUE)
    @ResponseBody
    public ResponseEntity<String> renderCheckoutPage(
            @RequestParam("reference") String reference,
            @RequestParam("amount") Double amount
    ) {
        String html = """
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>GoZone Sandbox Checkout</title>
                <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet">
                <style>
                    :root {
                        --bg-color: #0b0f19;
                        --surface-color: #151d30;
                        --primary-color: #00B14F;
                        --primary-hover: #009340;
                        --danger-color: #EF4444;
                        --danger-hover: #DC2626;
                        --text-color: #F3F4F6;
                        --text-muted: #9CA3AF;
                        --border-color: #1e293b;
                    }
                    body {
                        font-family: 'Outfit', sans-serif;
                        background-color: var(--bg-color);
                        color: var(--text-color);
                        margin: 0;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        padding: 16px;
                    }
                    .checkout-card {
                        background-color: var(--surface-color);
                        border-radius: 20px;
                        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3);
                        border: 1px solid var(--border-color);
                        width: 100%;
                        max-width: 440px;
                        padding: 32px;
                        text-align: center;
                        position: relative;
                        overflow: hidden;
                    }
                    .header {
                        margin-bottom: 24px;
                    }
                    .logo {
                        font-size: 24px;
                        font-weight: 700;
                        color: var(--primary-color);
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        margin-bottom: 8px;
                    }
                    .badge {
                        background: rgba(0, 177, 79, 0.1);
                        color: var(--primary-color);
                        border: 1px dashed var(--primary-color);
                        padding: 4px 12px;
                        border-radius: 9999px;
                        font-size: 12px;
                        font-weight: 600;
                        display: inline-block;
                    }
                    .amount-display {
                        font-size: 40px;
                        font-weight: 700;
                        margin: 20px 0;
                        color: #ffffff;
                    }
                    .info-grid {
                        background-color: rgba(255, 255, 255, 0.02);
                        border: 1px solid rgba(255, 255, 255, 0.05);
                        border-radius: 12px;
                        padding: 16px;
                        margin-bottom: 28px;
                        text-align: left;
                    }
                    .info-row {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 8px;
                        font-size: 14px;
                    }
                    .info-row:last-child {
                        margin-bottom: 0;
                    }
                    .info-label {
                        color: var(--text-muted);
                    }
                    .info-value {
                        font-weight: 600;
                        color: #ffffff;
                        word-break: break-all;
                    }
                    .btn {
                        display: block;
                        width: 100%;
                        padding: 14px 20px;
                        border-radius: 12px;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        border: none;
                        outline: none;
                        margin-bottom: 12px;
                    }
                    .btn-primary {
                        background-color: var(--primary-color);
                        color: #ffffff;
                    }
                    .btn-primary:hover {
                        background-color: var(--primary-hover);
                    }
                    .btn-secondary {
                        background-color: rgba(255, 255, 255, 0.05);
                        color: var(--text-color);
                        border: 1px solid var(--border-color);
                    }
                    .btn-secondary:hover {
                        background-color: rgba(255, 255, 255, 0.1);
                    }
                    .status-screen {
                        display: none;
                    }
                    .status-icon {
                        width: 64px;
                        height: 64px;
                        border-radius: 50%;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        margin-bottom: 20px;
                        font-size: 32px;
                    }
                    .success-icon {
                        background-color: rgba(0, 177, 79, 0.1);
                        color: var(--primary-color);
                    }
                    .error-icon {
                        background-color: rgba(239, 68, 68, 0.1);
                        color: var(--danger-color);
                    }
                </style>
            </head>
            <body>
                <div class="checkout-card" id="checkout-view">
                    <div class="header">
                        <div class="logo">GoZone Pay</div>
                        <span class="badge">SANDBOX SIMULATOR</span>
                    </div>
                    <div class="amount-display">GH₵ %AMOUNT%</div>
                    <div class="info-grid">
                        <div class="info-row">
                            <span class="info-label">Merchant</span>
                            <span class="info-value">GoZone SuperWallet</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Reference</span>
                            <span class="info-value">%REFERENCE%</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Integration</span>
                            <span class="info-value">Paystack API (Mocked)</span>
                        </div>
                    </div>
                    <button class="btn btn-primary" onclick="showStatus('success')">Authorize Payment</button>
                    <button class="btn btn-secondary" onclick="showStatus('decline')">Cancel & Decline</button>
                </div>

                <div class="checkout-card status-screen" id="success-view">
                    <div class="status-icon success-icon">✓</div>
                    <h2 style="margin-top: 0; color: #ffffff;">Payment Authorized</h2>
                    <p style="color: var(--text-muted); line-height: 1.5; margin-bottom: 24px;">
                        Your payment reference <strong>%REFERENCE%</strong> was successfully processed in Sandbox mode.
                    </p>
                    <div class="badge" style="margin-bottom: 24px;">SUCCESS</div>
                    <p style="font-size: 14px; color: var(--text-muted);">
                        Please return to the GoZone mobile app and click "Verify Top Up" to complete the top-up.
                    </p>
                </div>

                <div class="checkout-card status-screen" id="decline-view">
                    <div class="status-icon error-icon">✗</div>
                    <h2 style="margin-top: 0; color: #ffffff;">Payment Cancelled</h2>
                    <p style="color: var(--text-muted); line-height: 1.5; margin-bottom: 24px;">
                        The payment request was cancelled or declined by the user.
                    </p>
                    <div class="badge" style="background: rgba(239, 68, 68, 0.1); color: var(--danger-color); border: 1px dashed var(--danger-color); margin-bottom: 24px;">CANCELLED</div>
                    <p style="font-size: 14px; color: var(--text-muted);">
                        You can close this window and retry the transaction in the GoZone app.
                    </p>
                </div>

                <script>
                    function showStatus(status) {
                        document.getElementById('checkout-view').style.display = 'none';
                        if (status === 'success') {
                            document.getElementById('success-view').style.display = 'block';
                        } else {
                            document.getElementById('decline-view').style.display = 'block';
                        }
                    }
                </script>
            </body>
            </html>
            """
                .replace("%REFERENCE%", reference)
                .replace("%AMOUNT%", String.format("%.2f", amount));

        return ResponseEntity.ok(html);
    }
}
