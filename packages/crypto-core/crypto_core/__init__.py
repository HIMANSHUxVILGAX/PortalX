"""
PortelX Crypto Core
-------------------
Cryptographic primitives, non-reversible User Identity Token (UIT) generation,
and volatile memory buffer zeroization.
"""

from .uit import generate_uit, verify_uit
from .zeroize import zeroize_buffer, secure_wipe_memory

__all__ = ["generate_uit", "verify_uit",
           "zeroize_buffer", "secure_wipe_memory"]
