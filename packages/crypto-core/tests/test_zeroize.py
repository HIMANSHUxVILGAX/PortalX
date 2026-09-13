import ctypes
import pytest
from crypto_core.zeroize import zeroize_buffer, secure_wipe_memory


def test_zeroize_buffer_overwrites_with_null_bytes():
    # Arrange
    original_data = b"secret_data_to_be_wiped"
    buf = bytearray(original_data)

    # Act
    zeroize_buffer(buf)

    # Assert
    assert all(b == 0 for b in buf)
    assert buf == bytearray(b"\x00" * len(original_data))


def test_zeroize_buffer_length_unchanged():
    # Arrange
    original_data = b"secret_data_to_be_wiped"
    buf = bytearray(original_data)
    original_len = len(buf)

    # Act
    zeroize_buffer(buf)

    # Assert
    assert len(buf) == original_len


def test_zeroize_empty_buffer():
    # Arrange
    buf = bytearray(b"")

    # Act
    zeroize_buffer(buf)

    # Assert
    assert len(buf) == 0
    assert buf == bytearray(b"")


def test_zeroize_buffer_returns_latency():
    """zeroize_buffer must return execution time in milliseconds."""
    buf = bytearray(b"sensitive_payload_12345")
    latency_ms = zeroize_buffer(buf)
    assert isinstance(latency_ms, float)
    assert latency_ms >= 0.0


def test_secure_wipe_memory_zeroes_buffer():
    """secure_wipe_memory must zero out a ctypes-compatible buffer."""
    data = b"CONFIDENTIAL_SESSION_KEY_DATA"
    buf = bytearray(data)
    mv = memoryview(buf)

    latency_ms = secure_wipe_memory(mv)

    assert isinstance(latency_ms, float)
    assert latency_ms >= 0.0
    assert all(b == 0 for b in buf)


def test_secure_wipe_memory_length_preserved():
    """secure_wipe_memory must preserve buffer length after wiping."""
    buf = bytearray(b"secret_key_material_256bit")
    original_len = len(buf)
    mv = memoryview(buf)

    secure_wipe_memory(mv)

    assert len(buf) == original_len


def test_secure_wipe_memory_empty():
    """secure_wipe_memory must handle empty buffers without error."""
    buf = bytearray(b"")
    mv = memoryview(buf)

    latency_ms = secure_wipe_memory(mv)

    assert isinstance(latency_ms, float)
    assert len(buf) == 0
