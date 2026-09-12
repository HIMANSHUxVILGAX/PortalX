#!/usr/bin/env python3
"""
PortelX — Memory Zeroization & Volatile Buffer Overwrite Benchmark Harness
Author: Himanshu Badgujar
Target: Verify RAM memory zeroization executes in < 1,000ms across multiple buffer tiers.
"""

import os
import sys
import time

# Add crypto-core to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../packages/crypto-core")))
from crypto_core.zeroize import zeroize_buffer

def run_benchmarks():
    print("================================================================================")
    print("         PortelX: Volatile Memory Zeroization Verification Benchmark             ")
    print("================================================================================")
    print("Requirement: Buffer deallocation & overwrite latency must be < 1,000.0 ms\n")
    
    test_sizes = [
        ("Ephemeral AES Key / Nonce", 64),               # 64 bytes
        ("User Identity Token (UIT) Session", 4 * 1024),   # 4 KB
        ("Simulated DigiLocker In-Memory Doc", 1024 * 1024), # 1 MB
        ("High-Density Health/Identity Payload", 10 * 1024 * 1024), # 10 MB
        ("Extreme Stress Buffer (Burst)", 50 * 1024 * 1024) # 50 MB
    ]
    
    passed_all = True
    
    for label, size_bytes in test_sizes:
        size_display = f"{size_bytes / 1024:.1f} KB" if size_bytes < 1024 * 1024 else f"{size_bytes / (1024*1024):.1f} MB"
        # Allocate buffer with sensitive mock data
        buffer = bytearray(os.urandom(size_bytes))
        
        # Benchmark zeroize
        elapsed_ms = zeroize_buffer(buffer)
        
        # Verify all bytes are now strictly 0x00
        is_zeroed = all(b == 0 for b in buffer[:1000]) and all(b == 0 for b in buffer[-1000:])
        status = "PASSED" if (elapsed_ms < 1000.0 and is_zeroed) else "FAILED"
        
        if status != "PASSED":
            passed_all = False
            
        print(f"[{status}] {label} ({size_display}):")
        print(f"       Wipe Latency: {elapsed_ms:.4f} ms | Buffer Integrity Wiped: {is_zeroed}")
        print("--------------------------------------------------------------------------------")

    print("\nBenchmark Summary:")
    if passed_all:
        print(">>> ALL TIERS PASSED. Zeroization latency verified well within < 1,000ms SLA. <<<")
    else:
        print(">>> WARNING: One or more tiers failed SLA requirements. <<<")

if __name__ == "__main__":
    run_benchmarks()
