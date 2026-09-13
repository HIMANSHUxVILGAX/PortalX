# PortelX Primary Mobile App (`portelx-primary`)

The Primary Client serves as the user's permanent sovereign anchor. It securely manages:
- **Biometric Enclave Attestation:** Uses hardware keystores (`BiometricPrompt` on Android, `LocalAuthentication` / Secure Enclave on iOS).
- **WebAuthn Passkey Registration:** Handles out-of-band cryptographic challenges.
- **Session Authorizations & Instant Push Alerts:** Receives FCM push notifications when host devices request sessions or intent clearances.
- **Panic Revocation Switch:** Instantly broadcasts revocation signals to kill all active host sessions in < 1 second.

