# PortelX Host App (`portelx-host`)

The Host Client runs on foreign, borrowed, or kiosk devices as an ephemeral sandbox.

## Security Mandates:
1. **`FLAG_SECURE` Enforced:** All views prevent screenshots, screen recording, and task-switcher previews.
2. **Volatile-Only Memory:** No persistent SQLite, AsyncStorage, SharedPreferences, or Keychain entries.
3. **Sub-Second Shredding:** The moment the user presses "Finish", app loses focus, or session times out (TTL expired), all local memory buffers are wiped with random noise and null bytes (`< 1,000ms`).

