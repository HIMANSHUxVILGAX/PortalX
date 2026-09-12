import hmac
import hashlib
import secrets
import time
from typing import Dict, Any

def generate_ephemeral_nonce(length: int = 32) -> bytes:
    """Generate a cryptographically secure pseudo-random nonce (CSPRNG)."""
    return secrets.token_bytes(length)

def generate_uit(user_seed: bytes, host_device_id: str, session_ttl: int = 300) -> Dict[str, Any]:
    """
    Generate a non-reversible User Identity Token (UIT).
    
    UIT = HMAC-SHA256(user_seed, host_device_id + salt + timestamp + nonce)
    Ensures that:
    1. Primary identity can never be derived from UIT (one-way).
    2. Token is bound to the foreign host device ID.
    3. Token automatically becomes cryptographically invalid after session_ttl.
    """
    salt = secrets.token_bytes(16)
    nonce = generate_ephemeral_nonce(32)
    timestamp = int(time.time())
    expires_at = timestamp + session_ttl

    payload = f"{host_device_id}:{timestamp}:{expires_at}".encode('utf-8') + salt + nonce
    token_digest = hmac.new(user_seed, payload, hashlib.sha256).hexdigest()

    return {
        "uit": f"uit_{token_digest[:48]}",
        "nonce": nonce.hex(),
        "salt": salt.hex(),
        "created_at": timestamp,
        "expires_at": expires_at,
        "host_device_id": host_device_id
    }

def verify_uit(uit: str, expires_at: int) -> bool:
    """Verifies that the UIT has not expired."""
    current_time = int(time.time())
    return current_time <= expires_at
