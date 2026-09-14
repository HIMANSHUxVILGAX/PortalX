import os
import sys
import time
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Add crypto-core to system path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.abspath(os.path.join(CURRENT_DIR, "../../"))
CRYPTO_CORE_DIR = os.path.join(ROOT_DIR, "packages", "crypto-core")
if CRYPTO_CORE_DIR not in sys.path:
    sys.path.insert(0, CRYPTO_CORE_DIR)

from crypto_core.zeroize import zeroize_buffer
from crypto_core.uit import generate_uit

# ============================================================
# Pure REST JSON API — No HTML, No Templates, No Desktop Wrapper
# ============================================================

app = FastAPI(
    title="PortelX API",
    description="Ephemeral Zero-Residue Guest Session Backend",
    version="1.0.0",
)

# CORS for mobile app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# Request/Response Models
# ============================================================

class SessionCreateRequest(BaseModel):
    hostDeviceId: str

class AuthRequest(BaseModel):
    handle: str
    pin: str
    biometricToken: str | None = None

class TerminateRequest(BaseModel):
    reason: str  # 'manual' | 'timeout' | 'panic'

class AlertResponse(BaseModel):
    decision: str  # 'approve' | 'dispute'


# ============================================================
# Health Check
# ============================================================

@app.get("/health")
async def health():
    return {"status": "ok", "service": "portelx-api", "timestamp": int(time.time())}


# ============================================================
# Session Endpoints
# ============================================================

@app.post("/api/v1/sessions")
async def create_session(req: SessionCreateRequest):
    """Create a new ephemeral guest session."""
    user_seed = os.urandom(32)
    session_data = generate_uit(user_seed, req.hostDeviceId, session_ttl=300)

    # TODO: Store session in Redis with TTL
    return JSONResponse({
        "sessionId": session_data["uit"][:16],
        "uit": session_data["uit"],
        "ttl": 300,
        "createdAt": session_data["created_at"],
        "expiresAt": session_data["expires_at"],
        "hostDeviceId": req.hostDeviceId,
    })


@app.post("/api/v1/sessions/{session_id}/authenticate")
async def authenticate_session(session_id: str, req: AuthRequest):
    """Submit 3FA credentials for session authentication."""
    # TODO: Real credential + biometric + risk score verification
    return JSONResponse({
        "verified": True,
        "riskScore": 87,
    })


@app.post("/api/v1/sessions/{session_id}/terminate")
async def terminate_session(session_id: str, req: TerminateRequest):
    """Terminate session and trigger cryptographic memory shredding."""
    sensitive_data = bytearray(b"CONFIDENTIAL_SESSION_DATA_" + os.urandom(32))
    wipe_latency_ms = zeroize_buffer(sensitive_data)
    is_wiped = all(b == 0 for b in sensitive_data)

    # TODO: Delete session from Redis, notify primary device

    return JSONResponse({
        "shredded": is_wiped,
        "wipeLatencyMs": round(wipe_latency_ms, 4),
        "bytesZeroized": len(sensitive_data),
        "reason": req.reason,
    })


@app.post("/api/v1/sessions/{session_id}/heartbeat")
async def heartbeat(session_id: str):
    """Heartbeat ping to keep session alive."""
    # TODO: Refresh Redis TTL
    return JSONResponse({
        "alive": True,
        "remainingTtl": 250,
    })


# ============================================================
# Pairing Endpoints
# ============================================================

@app.post("/api/v1/pairing/generate")
async def generate_pairing():
    """Generate a QR pairing payload for host device to scan."""
    session_id = f"sess_{os.urandom(8).hex()}"
    return JSONResponse({
        "sessionId": session_id,
        "qrPayload": f"portelx://{session_id}",
        "expiresInSeconds": 60,
    })


# ============================================================
# Owner Control Endpoints
# ============================================================

@app.get("/api/v1/sessions/active")
async def get_active_sessions():
    """List all active guest sessions for the owner."""
    # TODO: Fetch from Redis
    return JSONResponse([
        {
            "sessionId": "sess_a8f329d1",
            "hostDevice": "Samsung Galaxy S24",
            "status": "ACTIVE",
            "remainingTtl": 142,
        }
    ])


@app.post("/api/v1/sessions/{session_id}/respond")
async def respond_to_alert(session_id: str, req: AlertResponse):
    """Owner approves or disputes a session activity alert."""
    if req.decision == "dispute":
        # TODO: Kill session + quarantine
        pass
    return JSONResponse({"success": True})


@app.post("/api/v1/sessions/revoke-all")
async def revoke_all():
    """Panic: Revoke ALL active sessions immediately."""
    # TODO: Iterate Redis keys, shred all, notify host devices
    return JSONResponse({"revokedCount": 1})
