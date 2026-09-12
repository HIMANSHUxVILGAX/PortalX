import ctypes
import os
import time
from typing import Tuple

def zeroize_buffer(buf: bytearray) -> float:
    """
    Zeroize a mutable bytearray in-place.
    Step 1: Overwrite with random bytes to thwart memory remanence attacks.
    Step 2: Fill with null bytes (0x00).
    
    Returns execution elapsed time in milliseconds.
    """
    start = time.perf_counter()
    length = len(buf)
    
    if length > 0:
        # Step 1: Overwrite with random noise
        random_noise = os.urandom(length)
        buf[:] = random_noise
        # Step 2: Overwrite with null bytes
        buf[:] = b'\x00' * length
        
    elapsed_ms = (time.perf_counter() - start) * 1000.0
    return elapsed_ms

def secure_wipe_memory(memory_view: memoryview) -> float:
    """
    Direct low-level memory shredding for ctypes/memoryview buffers.
    """
    start = time.perf_counter()
    length = len(memory_view)
    if length > 0:
        # Fill buffer with zeroes
        ctypes.memset(ctypes.addressof(ctypes.c_char.from_buffer(memory_view)), 0, length)
    elapsed_ms = (time.perf_counter() - start) * 1000.0
    return elapsed_ms
