# PortelX — OWASP MSTG Level 2 Threat Model Matrix

**Standard Compliance:** OWASP Mobile Security Testing Guide (MSTG) Level 2 & MASVS  
**Lead Security Architect:** Himanshu Badgujar  
**Classification:** Confidential / Defensive Engineering Specification  

---

## 1. System Threat Matrix

| Threat ID | Threat Vector | OWASP MSTG Ref | Attack Description | PortelX Mitigation Strategy | Verification Metric |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TH-01** | **Memory Remanence (RAM Dump)** | MSTG-STORAGE-1 | Attacker performs cold-boot attack or roots Host Device to dump RAM buffers looking for session keys / credentials. | Multi-pass memory zeroization: random noise overwrite followed by null-byte zeroization (`0x00`). | Latency $< 1,000\text{ ms}$; zero residual plaintext entropy. |
| **TH-02** | **Secondary Storage Residue** | MSTG-STORAGE-2 | Host app leaks tokens or personal data to SharedPreferences, SQLite, caches, or log files. | Strict Volatile-Only policy. No secondary storage drivers initialized; logs pseudonymized. | Disk diff shows 0 byte delta during active session. |
| **TH-03** | **Screen Recording & Analog Hole** | MSTG-RESILIENCE-1 | Malicious host app or screen recording service captures UI credentials / OTPs / UPI transactions. | `FLAG_SECURE` window attribute on Android; preview obfuscation on iOS; DRM-layer protected surface. | Screenshot / Screen recording returns black frames. |
| **TH-04** | **Replay & Relay Attack** | MSTG-CRYPTO-4 | Eavesdropper captures network packets to replay ephemeral authorizations on a different device. | CSPRNG 256-bit Nonce + Device Fingerprint binding in HMAC-SHA256 UIT with sub-second timestamps. | Replay attempt fails with invalid nonce/device signature. |
| **TH-05** | **Man-In-The-Middle (MITM)** | MSTG-NETWORK-1 | Attacker intercepts network traffic via rogue Wi-Fi or proxy certificates. | TLS 1.3 + Dynamic Public Key Pinning (HPKP) enforced on all WebSocket and REST rails. | Self-signed proxy connections rejected instantly. |
| **TH-06** | **Session Hijacking / Ghosting** | MSTG-AUTH-2 | User leaves Host Device unattended without logging out. | Ephemeral WebSocket Heartbeat Vitality Stream + 300s strict TTL eviction in volatile Redis. | Inactivity auto-shreds session at $t = \text{expiry}$. |

---

## 2. Hardened Zeroization Guarantee

```
[Session Active: Sensitive Data in RAM]
       │
       ▼ (Termination Event: Exit / Timeout / Panic)
[Step 1: Overwrite buffer with CSPRNG os.urandom]
       │
       ▼
[Step 2: Overwrite buffer with 0x00 null bytes]
       │
       ▼
[Step 3: Force garbage collector sweep & ctypes deallocate]
       │
       ▼
[< 1,000ms SLA Verified: Absolute Zero Residue]
```

