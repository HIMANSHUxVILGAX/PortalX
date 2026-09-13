import os
import time
import pytest
from crypto_core.uit import generate_uit, verify_uit


def test_generate_uit_structure():
    user_seed = b"test_seed_123"
    host_device_id = "host_abc"
    session_ttl = 300

    result1 = generate_uit(user_seed, host_device_id, session_ttl)
    result2 = generate_uit(user_seed, host_device_id, session_ttl)

    # Verify expected structure
    expected_keys = {"uit", "nonce", "salt",
                     "created_at", "expires_at", "host_device_id"}
    assert set(result1.keys()) == expected_keys

    assert result1["uit"].startswith("uit_")
    assert isinstance(result1["nonce"], str)
    assert isinstance(result1["salt"], str)
    assert isinstance(result1["created_at"], int)
    assert isinstance(result1["expires_at"], int)
    assert result1["host_device_id"] == host_device_id

    # Verify TTL is applied correctly
    assert result1["expires_at"] == result1["created_at"] + session_ttl

    # Verify unique nonces/salts across multiple generations
    assert result1["nonce"] != result2["nonce"]
    assert result1["salt"] != result2["salt"]
    assert result1["uit"] != result2["uit"]


def test_verify_uit_valid_token():
    """A correctly generated token must pass verification."""
    user_seed = os.urandom(32)
    host_device_id = "host_pixel_8"
    session = generate_uit(user_seed, host_device_id, session_ttl=300)

    result = verify_uit(
        uit=session["uit"],
        user_seed=user_seed,
        host_device_id=host_device_id,
        salt_hex=session["salt"],
        nonce_hex=session["nonce"],
        created_at=session["created_at"],
        expires_at=session["expires_at"],
    )
    assert result is True


def test_verify_uit_expired_token():
    """An expired token must be rejected even if the HMAC is correct."""
    user_seed = os.urandom(32)
    host_device_id = "host_pixel_8"
    session = generate_uit(user_seed, host_device_id, session_ttl=0)

    # Force expiry by using a past timestamp
    result = verify_uit(
        uit=session["uit"],
        user_seed=user_seed,
        host_device_id=host_device_id,
        salt_hex=session["salt"],
        nonce_hex=session["nonce"],
        created_at=session["created_at"],
        expires_at=session["created_at"] - 1,
    )
    assert result is False


def test_verify_uit_tampered_token():
    """A tampered token string must be rejected (HMAC mismatch)."""
    user_seed = os.urandom(32)
    host_device_id = "host_pixel_8"
    session = generate_uit(user_seed, host_device_id, session_ttl=300)

    tampered_uit = "uit_" + "a" * 48  # Fake token

    result = verify_uit(
        uit=tampered_uit,
        user_seed=user_seed,
        host_device_id=host_device_id,
        salt_hex=session["salt"],
        nonce_hex=session["nonce"],
        created_at=session["created_at"],
        expires_at=session["expires_at"],
    )
    assert result is False


def test_verify_uit_wrong_device():
    """Token verified against a different host device must be rejected."""
    user_seed = os.urandom(32)
    session = generate_uit(user_seed, "host_pixel_8", session_ttl=300)

    result = verify_uit(
        uit=session["uit"],
        user_seed=user_seed,
        host_device_id="host_iphone_15",  # Wrong device
        salt_hex=session["salt"],
        nonce_hex=session["nonce"],
        created_at=session["created_at"],
        expires_at=session["expires_at"],
    )
    assert result is False


def test_verify_uit_wrong_seed():
    """Token verified with a different user seed must be rejected."""
    user_seed = os.urandom(32)
    wrong_seed = os.urandom(32)
    session = generate_uit(user_seed, "host_pixel_8", session_ttl=300)

    result = verify_uit(
        uit=session["uit"],
        user_seed=wrong_seed,  # Wrong seed
        host_device_id="host_pixel_8",
        salt_hex=session["salt"],
        nonce_hex=session["nonce"],
        created_at=session["created_at"],
        expires_at=session["expires_at"],
    )
    assert result is False
