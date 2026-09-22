import os
import sys
import time
import uuid
import asyncio
from typing import Dict, Any, Optional
from fastapi import FastAPI, Request, Body
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel

from dotenv import load_dotenv

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(CURRENT_DIR, '.env'))

ROOT_DIR = os.path.abspath(os.path.join(CURRENT_DIR, "../../"))
CRYPTO_CORE_DIR = os.path.join(ROOT_DIR, "packages", "crypto-core")
if CRYPTO_CORE_DIR not in sys.path:
    sys.path.insert(0, CRYPTO_CORE_DIR)

from crypto_core.zeroize import zeroize_buffer
from crypto_core.uit import generate_uit, verify_uit
from .risk_scoring import score_session_risk

app = FastAPI(title="PayApp with PortelX")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

templates = Jinja2Templates(directory=os.path.join(CURRENT_DIR, "templates"))

class TerminateRequest(BaseModel):
    reason: str

# ----------------- Session Store -----------------
SESSIONS: Dict[str, Dict[str, Any]] = {}

async def _auto_destroy_session(session_id: str, delay: int):
    await asyncio.sleep(delay)
    if session_id in SESSIONS:
        session = SESSIONS.pop(session_id)
        if "buffer" in session and session["buffer"]:
            zeroize_buffer(session["buffer"])

# ----------------- UI Routes -----------------
@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("0_home.html", {"request": request})

@app.get("/profile", response_class=HTMLResponse)
async def profile_page(request: Request):
    return templates.TemplateResponse("0_profile.html", {"request": request})

@app.get("/verify", response_class=HTMLResponse)
async def verify_page(request: Request):
    return templates.TemplateResponse("1_verify.html", {"request": request})

@app.get("/role", response_class=HTMLResponse)
async def role_page(request: Request):
    return templates.TemplateResponse("2_role.html", {"request": request})

@app.get("/vault", response_class=HTMLResponse)
async def vault_page(request: Request):
    return templates.TemplateResponse("3_vault.html", {"request": request})

@app.get("/zeroized", response_class=HTMLResponse)
async def zeroized_page(request: Request):
    return templates.TemplateResponse("4_zeroized.html", {"request": request})

class VaultOpenRequest(BaseModel):
    handle: str = "@user"
    pin: str = "1234"

class VaultDestroyRequest(BaseModel):
    session_id: Optional[str] = None

class VerifyTokenRequest(BaseModel):
    uit: str
    session_id: str

# ----------------- API Routes -----------------
class RiskScoreRequest(BaseModel):
    handle: str
    device_id: str
    session_count_today: int

@app.post("/api/risk/score")
async def evaluate_risk(req: RiskScoreRequest):
    session_data = {
        "handle": req.handle,
        "device_id": req.device_id,
        "session_count_today": req.session_count_today,
        "timestamp": int(time.time())
    }
    risk_assessment = await score_session_risk(session_data)
    return JSONResponse(risk_assessment)

@app.post("/api/vault/open")
async def vault_open(req: VaultOpenRequest):
    user_seed = os.urandom(32)
    session_id = str(uuid.uuid4())
    ttl = 300
    host_device_id = "guest_mobile_device"
    
    # Generate the crypto UIT token
    session_data = generate_uit(user_seed, host_device_id, session_ttl=ttl)
    sensitive_data = bytearray(b"CONFIDENTIAL_SESSION_DATA_AADHAAR_UPI_KEYS_" + os.urandom(64))
    
    # Store session in memory
    SESSIONS[session_id] = {
        "session_id": session_id,
        "uit": session_data["uit"],
        "user_seed": user_seed,
        "salt": session_data["salt"],
        "nonce": session_data["nonce"],
        "host_device_id": session_data["host_device_id"],
        "created_at": session_data["created_at"],
        "expires_at": session_data["expires_at"],
        "buffer": sensitive_data
    }
    
    # Evaluate risk using Gemini API before opening vault
    risk_assessment = await score_session_risk({
        "handle": req.handle,
        "device_id": host_device_id,
        "session_count_today": 1,
        "action": "vault_open"
    })
    
    asyncio.create_task(_auto_destroy_session(session_id, ttl))
    
    return JSONResponse({
        "status": "success",
        "session_id": session_id,
        "uit": session_data["uit"],
        "ttl": ttl,
        "expires_at": session_data["expires_at"],
        "risk_assessment": risk_assessment
    })

@app.post("/api/vault/destroy")
async def vault_destroy(req: Optional[VaultDestroyRequest] = None):
    session_id = req.session_id if req else None
    
    if not session_id or session_id not in SESSIONS:
        return JSONResponse({"status": "error", "message": "Session not found"}, status_code=404)
        
    session = SESSIONS.pop(session_id)
    sensitive_data = session["buffer"]
    
    bytes_to_wipe = len(sensitive_data)
    wipe_latency_ms = zeroize_buffer(sensitive_data)
    is_wiped = all(b == 0 for b in sensitive_data)

    return JSONResponse({
        "status": "destroyed",
        "shredded": is_wiped,
        "wipe_latency_ms": round(wipe_latency_ms, 4),
        "bytes_zeroized": bytes_to_wipe,
    })

@app.get("/api/sessions/active")
async def active_sessions():
    return JSONResponse({
        "count": len(SESSIONS),
        "sessions": [
            {
                "session_id": s["session_id"],
                "uit": s["uit"],
                "expires_at": s["expires_at"]
            }
            for s in SESSIONS.values()
        ]
    })

@app.post("/api/vault/verify-token")
async def verify_token(req: VerifyTokenRequest):
    if req.session_id not in SESSIONS:
        return JSONResponse({"status": "error", "message": "Session not found"}, status_code=404)
        
    session = SESSIONS[req.session_id]
    
    is_valid = verify_uit(
        uit=req.uit,
        user_seed=session["user_seed"],
        host_device_id=session["host_device_id"],
        salt_hex=session["salt"],
        nonce_hex=session["nonce"],
        created_at=session["created_at"],
        expires_at=session["expires_at"]
    )
    
    if is_valid:
        return JSONResponse({"status": "success", "valid": True})
    else:
        return JSONResponse({"status": "error", "valid": False}, status_code=401)

@app.post("/api/v1/sessions/test/terminate")
async def terminate_test_session(req: TerminateRequest):
    sensitive_data = bytearray(b"CONFIDENTIAL_SESSION_DATA_" + os.urandom(64))
    bytes_to_wipe = len(sensitive_data)
    wipe_latency_ms = zeroize_buffer(sensitive_data)
    is_wiped = all(b == 0 for b in sensitive_data)

    return JSONResponse({
        "shredded": is_wiped,
        "wipeLatencyMs": round(wipe_latency_ms, 4),
        "bytesZeroized": bytes_to_wipe,
        "reason": req.reason,
    })
