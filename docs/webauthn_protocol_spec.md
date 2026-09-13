# PortelX — FIDO2 / WebAuthn Passkey Handshake Protocol

**Document Version:** 1.0  
**Domain:** Out-of-Band Primary Enclave Authentication & Dynamic Session Binding  

---

## 1. Handshake Protocol Sequence

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Host as Host Device (Ephemeral)
    participant Cloud as PortelX Cloud Engine
    participant Primary as Primary Device (Secure Enclave)

    User->>Host: 1. Launch PortelX & Display QR Code (Host ID + Ephemeral Public Key)
    User->>Primary: 2. Scan Host QR with Primary Camera
    Primary->>Cloud: 3. Initiate Session Request (Host ID + Initiator UIT)
    Cloud->>Primary: 4. Dispatch FIDO2 WebAuthn Challenge Nonce
    Primary->>Primary: 5. Biometric Attestation (TouchID / FaceID / BiometricPrompt)
    Primary->>Cloud: 6. Signed Assertion (Hardware Keystore Assertion Signature)
    Cloud->>Cloud: 7. Validate Assertion against Public Credential
    Cloud->>Host: 8. Establish Ephemeral WebSocket Session (Session Token + 300s TTL)
    Host->>User: 9. Ephemeral Workspace Ready (Borrow & Do)
```

---

## 2. Cryptographic Enclave Properties

1. **Hardware Root of Trust:** Primary passkey private keys are generated inside the device's hardware security module (Android StrongBox / iOS Secure Enclave) and marked as non-exportable.
2. **Ephemeral Binding:** The assertion signature incorporates the Host Device ID and a dynamic single-use challenge nonce, preventing token transplantation.
3. **Panic Revocation Stream:** Primary retains an open WebSocket to immediately send a remote wipe payload:
```json
{
  "action": "PANIC_PURGE",
  "sessionId": "sess_98fa71e...",
  "timestamp": 1789218200,
  "signature": "3045022100...[EnclaveSignature]"
}
```
Upon receipt, Host triggers immediate multi-pass zeroization in $< 1,000\text{ ms}$.

