"""
auth.py — Inicio de sesión administrativo
Guajiragua · Sistema BI Hidrogeológico

Variables de entorno requeridas (generarlas con `python crear_admin.py`):
    ADMIN_USER           usuario administrador
    ADMIN_PASSWORD_HASH  hash PBKDF2-SHA256 de la contraseña (nunca la contraseña en claro)
    AUTH_SECRET          clave aleatoria para firmar los tokens (mín. 32 caracteres)
Opcional:
    AUTH_TTL_MIN         minutos de vigencia del token (por defecto 60)

El token es un JSON firmado con HMAC-SHA256 que viaja en la cabecera
`Authorization: Bearer <token>`. Para proteger un endpoint:

    from auth import require_admin
    @router.post("", dependencies=[Depends(require_admin)])
"""

import base64
import hashlib
import hmac
import json
import os
import threading
import time
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/auth", tags=["Autenticación"])

PBKDF2_ITERATIONS = 600_000
MAX_FAILS_PER_IP = 5            # intentos fallidos por IP …
MAX_FAILS_GLOBAL = 20           # … y en total, dentro de la ventana
FAIL_WINDOW_S = 15 * 60

_bearer = HTTPBearer(auto_error=False)


# ── Configuración ─────────────────────────────────────────────────────────────
def _config():
    user = os.getenv("ADMIN_USER", "").strip()
    pwd_hash = os.getenv("ADMIN_PASSWORD_HASH", "").strip()
    secret = os.getenv("AUTH_SECRET", "")
    ttl = int(os.getenv("AUTH_TTL_MIN", "60") or 60)
    if not user or not pwd_hash or len(secret) < 32:
        return None
    return {"user": user, "hash": pwd_hash, "secret": secret.encode(), "ttl": ttl * 60}


def _not_configured():
    return HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="El inicio de sesión administrativo no está configurado en el servidor.",
    )


# ── Contraseñas ───────────────────────────────────────────────────────────────
def hash_password(password: str, iterations: int = PBKDF2_ITERATIONS) -> str:
    salt = os.urandom(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, iterations)
    return "pbkdf2_sha256${}${}${}".format(
        iterations, base64.b64encode(salt).decode(), base64.b64encode(dk).decode()
    )


def verify_password(password: str, encoded: str) -> bool:
    try:
        algo, iters, salt_b64, hash_b64 = encoded.split("$")
        if algo != "pbkdf2_sha256":
            return False
        dk = hashlib.pbkdf2_hmac(
            "sha256", password.encode(), base64.b64decode(salt_b64), int(iters)
        )
        return hmac.compare_digest(dk, base64.b64decode(hash_b64))
    except Exception:
        return False


# ── Tokens ────────────────────────────────────────────────────────────────────
def _b64(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def _unb64(data: str) -> bytes:
    return base64.urlsafe_b64decode(data + "=" * (-len(data) % 4))


def create_token(user: str, secret: bytes, ttl_s: int) -> tuple:
    now = int(time.time())
    exp = now + ttl_s
    payload = _b64(json.dumps({"sub": user, "iat": now, "exp": exp}, separators=(",", ":")).encode())
    sig = _b64(hmac.new(secret, payload.encode(), hashlib.sha256).digest())
    return f"{payload}.{sig}", exp


def decode_token(token: str, secret: bytes) -> Optional[dict]:
    try:
        payload, sig = token.split(".")
        expected = _b64(hmac.new(secret, payload.encode(), hashlib.sha256).digest())
        if not hmac.compare_digest(sig, expected):
            return None
        data = json.loads(_unb64(payload))
        if int(data.get("exp", 0)) < time.time():
            return None
        return data
    except Exception:
        return None


# ── Límite de intentos (en memoria; se reinicia con el proceso) ────────────────
_fails = {}            # clave -> [timestamps]
_fails_lock = threading.Lock()


def _recent(key: str, now: float) -> list:
    ts = [t for t in _fails.get(key, []) if now - t < FAIL_WINDOW_S]
    _fails[key] = ts
    return ts


def _client_ip(request: Request) -> str:
    return request.client.host if request.client else "desconocida"


def _check_rate(ip: str):
    now = time.time()
    with _fails_lock:
        if len(_recent("ip:" + ip, now)) >= MAX_FAILS_PER_IP or \
           len(_recent("global", now)) >= MAX_FAILS_GLOBAL:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Demasiados intentos fallidos. Intente de nuevo en 15 minutos.",
            )


def _register_fail(ip: str):
    now = time.time()
    with _fails_lock:
        _fails.setdefault("ip:" + ip, []).append(now)
        _fails.setdefault("global", []).append(now)


def _clear_fails(ip: str):
    with _fails_lock:
        _fails.pop("ip:" + ip, None)


# ── Dependencia para proteger endpoints ───────────────────────────────────────
def require_admin(creds: Optional[HTTPAuthorizationCredentials] = Depends(_bearer)) -> dict:
    cfg = _config()
    if cfg is None:
        raise _not_configured()
    data = decode_token(creds.credentials, cfg["secret"]) if creds else None
    if not data or not hmac.compare_digest(str(data.get("sub", "")), cfg["user"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sesión inválida o vencida.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return data


# ── Endpoints ─────────────────────────────────────────────────────────────────
class LoginIn(BaseModel):
    usuario: str = Field(..., min_length=1, max_length=100)
    contrasena: str = Field(..., min_length=1, max_length=256)


@router.post("/login")
def login(body: LoginIn, request: Request):
    cfg = _config()
    if cfg is None:
        raise _not_configured()

    ip = _client_ip(request)
    _check_rate(ip)

    # Se verifica siempre la contraseña (aunque el usuario no coincida)
    # para no revelar por tiempo de respuesta si el usuario existe.
    pwd_ok = verify_password(body.contrasena, cfg["hash"])
    user_ok = hmac.compare_digest(body.usuario.strip().encode(), cfg["user"].encode())

    if not (pwd_ok and user_ok):
        _register_fail(ip)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos.",
        )

    _clear_fails(ip)
    token, exp = create_token(cfg["user"], cfg["secret"], cfg["ttl"])
    return {"token": token, "usuario": cfg["user"], "expira": exp}


@router.get("/me")
def me(data: dict = Depends(require_admin)):
    return {"usuario": data["sub"], "expira": data["exp"]}
