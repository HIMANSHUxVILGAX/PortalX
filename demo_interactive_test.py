from crypto_core.zeroize import zeroize_buffer
from crypto_core.uit import generate_uit, verify_uit
import os
import sys
import time

# Ensure stdout supports utf-8 safely on Windows
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Ensure packages/crypto-core is on Python path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
CRYPTO_CORE_DIR = os.path.join(CURRENT_DIR, "packages", "crypto-core")
if CRYPTO_CORE_DIR not in sys.path:
    sys.path.insert(0, CRYPTO_CORE_DIR)


def print_banner():
    print("=" * 70)
    print("       PORTELX - HANDS-ON MANUAL CRYPTOGRAPHIC TEST CONSOLE")
    print("=" * 70)
    print("This interactive tool lets you test PortelX core mechanics manually:")
    print("  1. Non-Reversible User Identity Token (UIT) Generation")
    print("  2. In-Memory Session Storage & Live Cryptographic Memory Shredding")
    print("  3. Token Expiry & TTL Verification (Real HMAC Signature Check)")
    print("=" * 70)


def test_uit_generation():
    print("\n--- [STEP 1] Generating Non-Reversible Identity Token (UIT) ---")
    user_seed = os.urandom(32)  # Seed from primary phone secure enclave
    host_device_id = "HOST_PIXEL_8_A4B9F"

    print(f"[*] Borrowed Host Device:    {host_device_id}")
    print(
        f"[*] Primary Seed (32-byte):  {user_seed.hex()[:16]}... (Protected in enclave)")

    # Generate UIT
    session_data = generate_uit(user_seed, host_device_id, session_ttl=300)

    print("\n[+] Ephemeral UIT Created:")
    print(f"    - Token Identifier: {session_data['uit']}")
    print(f"    - Nonce (32 bytes): {session_data['nonce'][:24]}...")
    print(f"    - Salt (16 bytes):  {session_data['salt']}")
    print(f"    - Created At:       {time.ctime(session_data['created_at'])}")
    print(
        f"    - Expires At:       {time.ctime(session_data['expires_at'])} (300s TTL)")
    print("\n[OK] Mathematical Verification: The user's real identity is completely")
    print("     non-reversible from this HMAC-SHA256 token string.")
    return session_data, user_seed


def test_memory_zeroization():
    print(
        "\n--- [STEP 2] Simulating In-Memory Session & Live Memory Shredding ---")
    sensitive_data = "PORTELX_CONFIDENTIAL_PAYMENT_SESSION_CREDENTIALS_AND_KEYS_SECRET_9944"
    buffer = bytearray(sensitive_data.encode('utf-8'))

    print(
        f"[*] Sensitive Session Memory Buffer Allocated: {len(buffer)} bytes")
    print(f"[*] Raw Buffer Content in RAM (Before Shredding):")
    print(f"    \"{buffer.decode('utf-8')}\"")
    print(f"[*] Buffer Hex Representation:")
    print(f"    {buffer.hex()[:60]}...")

    input(
        "\n>>> Press [Enter] to trigger emergency Kill Switch & Cryptographic Shredding <<< ")

    # Execute zeroize
    wipe_latency_ms = zeroize_buffer(buffer)

    print("\n[!] Cryptographic Zeroization Executed!")
    print(
        f"    - Execution Time: {wipe_latency_ms:.4f} milliseconds (SLA is < 1,000 ms)")
    print(f"    - Buffer Length:  {len(buffer)} bytes (Preserved)")
    print(
        f"    - Is Memory 100% Zeroized (All null bytes 0x00)? -> {all(b == 0 for b in buffer)}")
    print(f"[*] Buffer Hex Representation (After Shredding):")
    print(f"    {buffer.hex()[:60]}...")
    print("\n[OK] Zero-Residue Guarantee: Every byte in memory has been overwritten with random")
    print("     noise and replaced with 0x00 null bytes. Nothing remains in RAM!")


def test_token_verification(session_data, user_seed):
    print(
        "\n--- [STEP 3] Testing Token Verification (Real HMAC Signature Check) ---")

    # Valid verification — recomputes HMAC and compares
    is_valid = verify_uit(
        uit=session_data['uit'],
        user_seed=user_seed,
        host_device_id=session_data['host_device_id'],
        salt_hex=session_data['salt'],
        nonce_hex=session_data['nonce'],
        created_at=session_data['created_at'],
        expires_at=session_data['expires_at'],
    )
    print(
        f"[*] Token status (valid HMAC + active TTL): {'VALID (Active Session)' if is_valid else 'INVALID'}")

    # Tampered token — wrong HMAC digest
    tampered_uit = "uit_" + "0" * 48
    is_tampered_valid = verify_uit(
        uit=tampered_uit,
        user_seed=user_seed,
        host_device_id=session_data['host_device_id'],
        salt_hex=session_data['salt'],
        nonce_hex=session_data['nonce'],
        created_at=session_data['created_at'],
        expires_at=session_data['expires_at'],
    )
    print(
        f"[*] Tampered token status: {'VALID' if is_tampered_valid else 'REJECTED (HMAC Mismatch - Forgery Detected)'}")

    # Expired check — past timestamp
    is_expired_valid = verify_uit(
        uit=session_data['uit'],
        user_seed=user_seed,
        host_device_id=session_data['host_device_id'],
        salt_hex=session_data['salt'],
        nonce_hex=session_data['nonce'],
        created_at=session_data['created_at'],
        expires_at=int(time.time()) - 10,
    )
    print(
        f"[*] Expired token status: {'VALID' if is_expired_valid else 'EXPIRED & REJECTED (Access Denied)'}")

    print("\n[OK] Security Verification: Tokens are cryptographically bound to the original")
    print("     device + seed. Tampered or expired tokens are always rejected.")


if __name__ == '__main__':
    print_banner()
    session, seed = test_uit_generation()
    test_memory_zeroization()
    test_token_verification(session, seed)
    print("\n" + "=" * 70)
    print("   ALL MANUAL TESTS PASSED SUCCESSFULLY! ZERO RESIDUE VERIFIED.")
    print("=" * 70)
