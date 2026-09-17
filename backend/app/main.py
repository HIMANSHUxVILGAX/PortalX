import os
import sys
import time
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.abspath(os.path.join(CURRENT_DIR, "../../"))
CRYPTO_CORE_DIR = os.path.join(ROOT_DIR, "packages", "crypto-core")
if CRYPTO_CORE_DIR not in sys.path:
    sys.path.insert(0, CRYPTO_CORE_DIR)

from crypto_core.zeroize import zeroize_buffer
from crypto_core.uit import generate_uit

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

# ----------------- API Routes -----------------
@app.post("/api/vault/open")
async def vault_open(req: VaultOpenRequest):
    user_seed = os.urandom(32)
    session_data = generate_uit(user_seed, "guest_mobile_device", session_ttl=300)
    return JSONResponse({
        "status": "success",
        "uit": session_data["uit"],
        "ttl": 300,
        "expires_at": session_data["expires_at"]
    })

@app.post("/api/vault/destroy")
async def vault_destroy():
    sensitive_data = bytearray(b"CONFIDENTIAL_SESSION_DATA_AADHAAR_UPI_KEYS_" + os.urandom(64))
    bytes_to_wipe = len(sensitive_data)
    wipe_latency_ms = zeroize_buffer(sensitive_data)
    is_wiped = all(b == 0 for b in sensitive_data)

    return JSONResponse({
        "status": "destroyed",
        "shredded": is_wiped,
        "wipe_latency_ms": round(wipe_latency_ms, 4),
        "bytes_zeroized": bytes_to_wipe,
    })

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
