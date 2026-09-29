# 🛡️ PortelX - Next-Gen Ephemeral Secure Vault

PortelX is a conceptual, high-security fintech application designed to solve the "stranger trust" problem. Have you ever needed to lend your phone to a stranger for a quick call or payment, but felt anxious about your banking apps, crypto wallets, and personal data being exposed?

PortelX creates an **isolated, ephemeral secure enclave (Guest Vault)** on your device. It streams just enough identity and payment credentials for a single transaction, monitors risk in real-time, and **irreversibly shreds (zeroizes)** the session data the moment the vault is closed.

> **⚠️ Hackathon Prototype Disclaimer**
> This project was built as a proof-of-concept for a hackathon. While the UI, local state, hardware animations, backend architecture, and RevenueCat subscription flow are fully functional, **it is not a 100% production-ready financial product yet**. It is built targeting a "Next-Gen" vision of security. To see what it takes to make this 100% real, see the [Roadmap to Production](#-roadmap-to-100-production) section below.

---

## ✨ Features Built (Hackathon MVP)

- **Ephemeral Guest Vault**: A visually isolated environment with its own dummy balance, timer, and panic-revoke capabilities.
- **Backend Zeroization Engine (Simulated)**: FastAPI backend that tracks session states and simulates DOD-level memory shredding (overwriting buffers with `0x00`) when a session expires or is manually revoked.
- **AI-Powered Risk Scoring**: Google Gemini API integration in the backend to evaluate the risk of a guest session based on device hardware, location, and behavior.
- **RevenueCat Integration**: Premium tier subscription management using RevenueCat, giving premium users access to unlimited secure guest sessions.
- **Crypto & Fiat Portfolio**: Beautiful, lag-free UI for managing crypto assets and fiat bank accounts.
- **Local Password Manager**: A secure, on-device password vault.
- **Performance Optimized**: 60fps buttery-smooth React Native UI with Native UI Thread animations (`useNativeDriver: true`) to prevent JS-thread blocking.

---

## 🏗️ Tech Stack

### Frontend (Mobile App)
- **Framework**: React Native (Expo)
- **State Management**: Zustand
- **Navigation**: Expo Router (File-based)
- **Monetization**: RevenueCat (`react-native-purchases`)
- **Animations**: React Native Animated API (Native Driver)

### Backend (API & Enclave Simulator)
- **Framework**: FastAPI (Python)
- **Database**: SQLite with SQLAlchemy
- **AI Integration**: Google Gemini API (Session Risk Scoring)
- **Real-time**: WebSockets (For remote kill-switch / Panic Revoke)

---

## 🚀 How to Run Locally

### 1. Backend Setup
Navigate to the backend directory, activate the virtual environment, and start the Uvicorn server:
```bash
cd portelx/backend
# Activate virtual environment
.venv\Scripts\activate   # On Windows
# Run the FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8002 --reload
```

### 2. Frontend Setup
Navigate to the app directory, install dependencies, and start Expo:
```bash
cd portelx/app
npm install
npx expo start -c
```
*(Ensure you update `API_BASE_URL` in `app/src/constants/config.ts` with your local IP if testing on a physical device).*

---

## 📂 Project Structure

```text
portelx/
├── app/                      # React Native Expo Frontend
│   ├── app/                  # Expo Router Screens (Dashboard, Vault, Crypto, Subscriptions)
│   ├── src/                  # Frontend Source Code
│   │   ├── components/       # Reusable UI components
│   │   ├── constants/        # Configs (API Base URL, styling constants)
│   │   ├── services/         # Axios API clients
│   │   └── store/            # Zustand global state (AppStore, SessionStore)
│   └── package.json          # Frontend dependencies (RevenueCat, Expo, etc.)
│
└── backend/                  # FastAPI Python Backend
    ├── app/                  # Backend Source Code
    │   ├── main.py           # Core API endpoints (Vault, Pay, Destroy) & WebSockets
    │   ├── models.py         # SQLAlchemy Database Models (Users, Sessions)
    │   └── risk_scoring.py   # Gemini AI Integration for Risk Assessment
    ├── portelx.db            # Local SQLite database
    └── requirements.txt      # Python dependencies (fastapi, uvicorn, google-genai)
```

---

## 🚧 Roadmap to 100% Production

PortelX targets a highly regulated space. To transition this from a hackathon prototype to a fully operational, legally compliant financial product, we must acquire the following **11 Permissions & Authorities**:

1. **RBI** — Payment Aggregator License
2. **NPCI** — UPI membership
3. **PCI DSS** — Card data certification
4. **Visa** — Direct agreement
5. **Mastercard** — Direct agreement
6. **Acquiring Bank** — Partnership
7. **FIU-IND** — PMLA registration (crypto)
8. **VASP License** — Crypto operations
9. **UIDAI** — Aadhaar access
10. **NIC** — DigiLocker integration
11. **DPDP Act 2023** — Data protection compliance

### Technical Milestones Remaining
- **Hardware Security Module (HSM) Integration**: Moving the simulated Python zeroization buffer into actual mobile Secure Enclave / TrustZone hardware.
- **Real Bank APIs**: Replacing dummy balances with actual banking API gateways (e.g., Plaid, Setu, or direct acquiring bank APIs).
- **Production Identity Verification**: Integrating real video-KYC and Aadhaar OTP validation.
