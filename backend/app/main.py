from crypto_core.uit import generate_uit, verify_uit
from crypto_core.zeroize import zeroize_buffer
import os
import sys
import time
import uuid
import asyncio
import logging
import datetime
from typing import Dict, Any, Optional

from fastapi import FastAPI, Depends, Request, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from .models import init_db, SessionLocal, GuestSession, PaymentTransaction, User, SubscriptionTier, PaymentCard, IdentityDocument, StoredPassword
from .risk_scoring import score_session_risk

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(CURRENT_DIR, '.env'))

ROOT_DIR = os.path.abspath(os.path.join(CURRENT_DIR, "../../"))
CRYPTO_CORE_DIR = os.path.join(ROOT_DIR, "packages", "crypto-core")
if CRYPTO_CORE_DIR not in sys.path:
    sys.path.insert(0, CRYPTO_CORE_DIR)


logger = logging.getLogger('portelx')
logger.setLevel(logging.INFO)
if not logger.handlers:
    ch = logging.StreamHandler()
    ch.setLevel(logging.INFO)
    logger.addHandler(ch)

app = FastAPI(title="PayApp with PortelX")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- WebSocket Manager -----------------


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        self.active_connections[session_id] = websocket
        logger.info(f"WS Connected: {session_id}")

    def disconnect(self, session_id: str):
        if session_id in self.active_connections:
            del self.active_connections[session_id]
            logger.info(f"WS Disconnected: {session_id}")

    async def kill_vault(self, session_id: str):
        if session_id in self.active_connections:
            websocket = self.active_connections[session_id]
            try:
                await websocket.send_json({"action": "KILL", "reason": "Host revoked vault access."})
                logger.info(f"WS KILL signal sent to: {session_id}")
            except Exception as e:
                logger.error(f"WS Send Error on kill: {e}")


manager = ConnectionManager()

# ----------------- Session Store -----------------
SESSIONS: Dict[str, Dict[str, Any]] = {}

# ----------------- Progressive Lockout Engine -----------------
FAILED_ATTEMPTS: Dict[str, dict] = {}


def check_lockout(device_id: str):
    if device_id in FAILED_ATTEMPTS:
        data = FAILED_ATTEMPTS[device_id]
        if data['count'] >= 3:
            time_passed = time.time() - data['last_attempt']
            if time_passed < 300:
                raise HTTPException(
                    status_code=429, detail=f"Too many failed attempts. Locked for {int(300 - time_passed)}s")
            else:
                FAILED_ATTEMPTS.pop(device_id)


def record_failed_attempt(device_id: str):
    if device_id not in FAILED_ATTEMPTS:
        FAILED_ATTEMPTS[device_id] = {'count': 1, 'last_attempt': time.time()}
    else:
        FAILED_ATTEMPTS[device_id]['count'] += 1
        FAILED_ATTEMPTS[device_id]['last_attempt'] = time.time()


async def _auto_destroy_session(session_id: str, delay: int):
    await asyncio.sleep(delay)
    if session_id in SESSIONS:
        session = SESSIONS.pop(session_id)
        if "buffer" in session and session["buffer"]:
            zeroize_buffer(session["buffer"])


class VaultOpenRequest(BaseModel):
    handle: str = "@user"
    pin: str = "1234"
    device_name: Optional[str] = "Mobile Device"
    device_brand: Optional[str] = None
    location: Optional[str] = "Unknown Location"


class VaultDestroyRequest(BaseModel):
    session_id: Optional[str] = None


class VerifyTokenRequest(BaseModel):
    uit: str
    session_id: str

# ----------------- WebSocket Routes -----------------


@app.websocket("/api/vault/ws/{session_id}")
async def vault_websocket(websocket: WebSocket, session_id: str):
    await manager.connect(websocket, session_id)
    try:
        while True:
            # Heartbeat ping
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(session_id)


class RemoteKillRequest(BaseModel):
    session_id: str


@app.post("/api/vault/remote-kill")
async def remote_kill(req: RemoteKillRequest):
    if req.session_id not in SESSIONS:
        return JSONResponse({"status": "error", "message": "Session not found"}, status_code=404)

    # Broadcast KILL signal to the active WebSocket client
    await manager.kill_vault(req.session_id)
    return {"status": "success", "message": "KILL signal broadcasted to vault"}

# ----------------- API Routes -----------------


class RiskScoreRequest(BaseModel):
    handle: str
    device_id: str
    session_count_today: int


@app.on_event('startup')
def startup_event():
    init_db()
    logger.info("Database initialized.")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/api/user/profile")
async def get_user_profile(db: Session = Depends(get_db)):
    user = db.query(User).filter(User.handle == "@rahul").first()
    if not user:
        return JSONResponse({"status": "error", "message": "User not found"}, status_code=404)

    sub = db.query(SubscriptionTier).filter(
        SubscriptionTier.user_id == user.id).first()
    sub_data = None
    if sub:
        sub_data = {
            "tier": sub.tier,
            "name": sub.name,
            "price": sub.price,
            "sessions_allowed": sub.sessions_allowed,
            "sessions_used": sub.sessions_used,
            "is_active": sub.is_active
        }

    return JSONResponse({
        "display_name": user.display_name,
        "handle": user.handle,
        "upi_id": user.upi_id,
        "avatar_url": user.avatar_url,
        "kyc_verified": user.kyc_verified,
        "subscription": sub_data
    })


@app.get("/api/vault/history")
async def get_vault_history(db: Session = Depends(get_db)):
    sessions = db.query(GuestSession).order_by(
        GuestSession.created_at.desc()).all()
    history = []
    for s in sessions:
        history.append({
            "session_id": s.session_id,
            "room_id": s.session_id,
            "device_name": s.device_name or "Mobile Device",
            "device_brand": s.device_brand,
            "location": s.location or "Unknown Location",
            "created_at": s.created_at.isoformat() if s.created_at else None,
            "date": s.created_at.strftime("%d %b, %I:%M %p") if s.created_at else "Recent",
            "duration_seconds": s.duration_seconds or 0,
            "bytes_zeroized": s.bytes_zeroized or 0,
            "risk_score": s.risk_score,
            "is_active": s.is_active,
            "status": "ACTIVE" if s.is_active else "SHREDDED"
        })
    return JSONResponse(history)


@app.get("/api/transactions")
async def get_transactions(db: Session = Depends(get_db)):
    txs = db.query(PaymentTransaction).order_by(
        PaymentTransaction.timestamp.desc()).all()
    transactions = []
    for tx in txs:
        transactions.append({
            "id": tx.id,
            "session_id": tx.session_id,
            "vpa": tx.vpa,
            "merchant_name": tx.merchant_name,
            "amount": tx.amount,
            "status": tx.status,
            "timestamp": tx.timestamp.isoformat() if tx.timestamp else None
        })
    return JSONResponse(transactions)


@app.get("/api/cards")
async def get_cards(db: Session = Depends(get_db)):
    user = db.query(User).filter(User.handle == "@rahul").first()
    if not user:
        return JSONResponse([])

    cards = db.query(PaymentCard).filter(PaymentCard.user_id == user.id).all()
    res = []
    for c in cards:
        res.append({
            "id": str(c.id),
            "bank": c.bank,
            "network": c.network,
            "balance": c.balance,
            "maskedNumber": c.masked_number,
            "expires": c.expires,
            "backgroundColor": c.background_color,
            "badge": c.badge
        })
    return JSONResponse(res)


@app.get("/api/docs")
async def get_docs(db: Session = Depends(get_db)):
    user = db.query(User).filter(User.handle == "@rahul").first()
    if not user:
        return JSONResponse([])

    docs = db.query(IdentityDocument).filter(
        IdentityDocument.user_id == user.id).all()
    res = []
    for d in docs:
        res.append({
            "id": str(d.id),
            "title": d.title,
            "subtitle": d.subtitle,
            "icon": d.icon,
            "verified": d.verified,
            "source": d.source
        })
    return JSONResponse(res)


class CardCreateRequest(BaseModel):
    bank: str
    network: str
    balance: float
    maskedNumber: str
    expires: str
    backgroundColor: str
    badge: str


@app.post("/api/cards")
async def add_card(req: CardCreateRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.handle == "@rahul").first()
    new_card = PaymentCard(
        user_id=user.id if user else 1,
        bank=req.bank,
        network=req.network,
        balance=req.balance,
        masked_number=req.maskedNumber,
        expires=req.expires,
        background_color=req.backgroundColor,
        badge=req.badge
    )
    db.add(new_card)
    db.commit()
    return JSONResponse({"status": "success", "id": str(new_card.id)})


class DocCreateRequest(BaseModel):
    title: str
    subtitle: str
    icon: str
    source: str


@app.post("/api/docs")
async def add_doc(req: DocCreateRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.handle == "@rahul").first()
    new_doc = IdentityDocument(
        user_id=user.id if user else 1,
        title=req.title,
        subtitle=req.subtitle,
        icon=req.icon,
        verified=True,
        source=req.source
    )
    db.add(new_doc)
    db.commit()
    return JSONResponse({"status": "success", "id": str(new_doc.id)})


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
async def vault_open(req: VaultOpenRequest, db: Session = Depends(get_db)):
    user_seed = os.urandom(32)
    session_id = str(uuid.uuid4())
    ttl = 300
    host_device_id = "guest_mobile_device"

    user = db.query(User).filter(User.handle == req.handle).first()
    if not user:
        user = db.query(User).filter(User.handle == "@rahul").first()

    if user and user.pin_hash != f"hashed_{req.pin}":
        logger.warning(f"Invalid PIN attempt for {req.handle}")
        raise HTTPException(status_code=401, detail="Invalid PIN")

    # Generate the crypto UIT token
    session_data = generate_uit(user_seed, host_device_id, session_ttl=ttl)
    # Dynamic volatile enclave buffer (dynamic memory allocation for session state + crypto buffers)
    base_payload = f"PORTELX_ENCLAVE_{session_id}_{req.handle}_{user_seed}_{time.time()}".encode(
    )
    # Dynamic chunk size between 64KB and 192KB varying on each session
    dynamic_entropy_size = 65536 + (os.urandom(2)[0] * 512)
    sensitive_data = bytearray(base_payload + os.urandom(dynamic_entropy_size))

    # Store session in memory for zeroization
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

    # Save to SQLite DB
    user_id = user.id if user else 1
    new_session = GuestSession(
        session_id=session_id,
        uit_token=session_data["uit"],
        user_id=user_id,
        expires_at=datetime.datetime.fromtimestamp(
            session_data["expires_at"], tz=datetime.timezone.utc),
        risk_score=risk_assessment.get("risk_score", 0.0),
        device_name=req.device_name,
        device_brand=req.device_brand,
        location=req.location
    )
    db.add(new_session)
    db.commit()

    logger.info(f"[PORTELX BACKEND] SECURE VAULT OPENED!")
    logger.info(f"-> Session ID  : {session_id}")
    logger.info(f"-> UIT Token   : {session_data['uit']}")
    logger.info(
        f"-> Risk Score  : {risk_assessment.get('risk_score', 'N/A')}/10 ({risk_assessment.get('risk_level', 'UNKNOWN')})")
    logger.info(
        f"-> Gemini Rec  : {risk_assessment.get('recommendation', '')}")
    logger.info(f"-> DB Status   : Session Saved to SQLite Database.")

    asyncio.create_task(_auto_destroy_session(session_id, ttl))

    return JSONResponse({
        "status": "success",
        "session_id": session_id,
        "uit": session_data["uit"],
        "ttl": ttl,
        "expires_at": session_data["expires_at"],
        "risk_assessment": risk_assessment
    })


class PayRequest(BaseModel):
    session_id: str = "guest_default"
    amount: float
    vpa: str
    merchant_name: str
    pin: str


@app.post("/api/vault/pay")
async def vault_pay(req: PayRequest, db: Session = Depends(get_db)):
    logger.info(f"[PORTELX BACKEND] INITIATING GUEST PAYMENT!")
    logger.info(f"-> Merchant : {req.merchant_name} ({req.vpa})")
    logger.info(f"-> Amount   : {req.amount}")

    # Try to find the user from session or fallback to default
    session_record = db.query(GuestSession).filter(
        GuestSession.session_id == req.session_id).first()
    user = None
    if session_record:
        user = db.query(User).filter(User.id == session_record.user_id).first()
    if not user:
        user = db.query(User).filter(User.handle == "@rahul").first()

    # Hackathon Demo: Accept any PIN (or specifically check for length)
    # so the user doesn't get blocked during presentation if they type a random PIN.
    if not req.pin or len(req.pin) < 4:
        logger.error(f"[ERROR] Payment FAILED: Invalid PIN format.")
        return JSONResponse({"status": "error", "message": "PIN must be at least 4 digits!"}, status_code=403)

    # Log payment in SQLite
    new_payment = PaymentTransaction(
        session_id=req.session_id,
        vpa=req.vpa,
        merchant_name=req.merchant_name,
        amount=req.amount,
        status="SUCCESS"
    )
    db.add(new_payment)
    db.commit()

    logger.info(f"[SUCCESS] Payment SUCCESSFUL: Saved to SQLite Database.")

    return JSONResponse({"status": "success", "message": f"Paid Rs. {req.amount:,.2f} securely."})


@app.post("/api/vault/destroy")
async def vault_destroy(req: VaultDestroyRequest, db: Session = Depends(get_db)):
    session_id = req.session_id if req else None

    if not session_id or session_id not in SESSIONS:
        return JSONResponse({"status": "error", "message": "Session not found"}, status_code=404)

    session = SESSIONS.pop(session_id)
    sensitive_data = session["buffer"]

    bytes_to_wipe = len(sensitive_data)
    wipe_latency_ms = zeroize_buffer(sensitive_data)
    is_wiped = all(b == 0 for b in sensitive_data)

    db_session = db.query(GuestSession).filter(
        GuestSession.session_id == session_id).first()
    if db_session:
        db_session.is_active = False
        now_utc = datetime.datetime.now(datetime.timezone.utc)
        db_session.destroyed_at = now_utc
        if db_session.created_at:
            # Handle tz-naive or tz-aware
            c_at = db_session.created_at
            if c_at.tzinfo is None:
                c_at = c_at.replace(tzinfo=datetime.timezone.utc)
            delta = (now_utc - c_at).total_seconds()
            db_session.duration_seconds = max(1, int(delta))
        db_session.bytes_zeroized = bytes_to_wipe
        db.commit()

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


class TerminateRequest(BaseModel):
    reason: str


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


class PasswordCreateRequest(BaseModel):
    service: str
    username: str
    password: str


@app.get("/api/passwords")
async def get_passwords(db: Session = Depends(get_db)):
    user = db.query(User).filter(User.handle == "@rahul").first()
    if not user:
        return JSONResponse([])

    passwords = db.query(StoredPassword).filter(
        StoredPassword.user_id == user.id).all()
    res = []
    for p in passwords:
        res.append({
            "id": p.id,
            "service": p.service,
            "username": p.username,
            "password": p.password
        })
    return JSONResponse(res)


@app.post("/api/passwords")
async def add_password(req: PasswordCreateRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.handle == "@rahul").first()
    if not user:
        return JSONResponse({"status": "error", "message": "User not found"}, status_code=404)

    new_password = StoredPassword(
        user_id=user.id,
        service=req.service,
        username=req.username,
        password=req.password
    )
    db.add(new_password)
    db.commit()
    db.refresh(new_password)

    return JSONResponse({
        "status": "success",
        "password": {
            "id": new_password.id,
            "service": new_password.service,
            "username": new_password.username,
            "password": new_password.password
        }
    })


@app.delete("/api/passwords/{id}")
async def delete_password(id: int, db: Session = Depends(get_db)):
    password = db.query(StoredPassword).filter(StoredPassword.id == id).first()
    if password:
        db.delete(password)
        db.commit()
        return JSONResponse({"status": "success"})
    return JSONResponse({"status": "error", "message": "Not found"}, status_code=404)
