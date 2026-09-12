# PortelX (PhantomID) ⚡
> **Universal Temporary Identity Layer — *"Borrow. Do. Disappear."***

PortelX enables an **Initiator** to securely project their digital identity—including payment capabilities (UPI), sovereign credentials, health records, and corporate authorizations—onto an arbitrary foreign **Host Device** inside a cryptographically bounded, ephemeral execution bubble.

Upon lifecycle completion, manual revocation, or timeout trigger, PortelX executes **sub-second memory shredding (< 1,000ms)**, ensuring absolute zero residual footprint on the foreign hardware.

---

## 🏛️ Repository Architecture

```
portelx/
├── apps/
│   ├── mobile-primary/        # Initiator Phone App (Identity Anchor, WebAuthn Passkeys, Biometrics)
│   └── mobile-host/           # Foreign / Guest Device App (Ephemeral Runtime, FLAG_SECURE, Zero-Storage)
│
├── backend/                   # Asynchronous Core Engine (FastAPI, WebSockets Vitality, Redis TTL)
│   ├── app/
│   │   ├── api/v1/            # REST API & WebSocket endpoints
│   │   ├── core/              # Security, UIT mathematical generator, settings
│   │   ├── models/            # Pydantic state schemas
│   │   └── services/          # Ephemeral Redis TTL store, shredder, anomaly scorer
│   ├── Dockerfile
│   └── requirements.txt
│
├── packages/
│   ├── crypto-core/           # Python cryptographic library (UIT, AES-256-GCM, RAM zeroization)
│   └── protocol-types/        # Shared cross-client TypeScript schemas & protocol definitions
│
├── benchmarks/                # Cryptographic & Hardware Verification Harnesses
│   └── memory_zeroize/        # Volatile RAM overwriting & benchmark test suite (<1000ms)
│
├── docs/                      # Architectural Specifications & Security Threat Models
│   ├── threat_model_mstg_l2.md
│   └── webauthn_protocol_spec.md
│
├── docker-compose.yml         # Zero-persistence Redis & Backend Orchestration
└── .env.example               # Configuration template
```

---

## 🚀 Quickstart Guide

### 1. Ephemeral In-Memory Redis & Backend
```bash
# Start zero-persistence in-memory Redis
docker compose up redis -d

# Run backend locally (Python 3.11+)
cd backend
python -m venv venv
venv\Scripts\activate          # Windows pwsh
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 2. Run Phase 1 RAM Zeroization Benchmark
```bash
python benchmarks/memory_zeroize/zeroize_benchmark.py
```

---

## 🔒 Security Baseline
- **Volatile-Only Memory:** No secondary storage writes (NAND Flash / SQLite / SharedPreferences).
- **Sub-Second Wipe:** All allocated cryptographic secrets are overwritten with random bytes followed by null bytes in $< 1,000\text{ ms}$.
- **OWASP MSTG Level 2 Compliant:** Defends against analog hole, background screenshot injection (`FLAG_SECURE`), and IPC snooping.
