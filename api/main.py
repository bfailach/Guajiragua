"""
main.py — FastAPI · Sistema BI Hidrogeológico Guajiragua
Metodología Kimball DWH · UMB · Ing. de Negocios

Ejecutar:
    cd api
    uvicorn main:app --reload --port 8000

Docs interactivos:
    http://localhost:8000/docs
"""

import logging
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routers import kpis, puntos, municipios, alertas, series
import auth
from database import get_client

load_dotenv()

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title       = "Guajiragua API",
    description = "Sistema BI Hidrogeológico · La Guajira · Metodología Kimball DWH",
    version     = "1.0.0",
    docs_url    = "/docs",
    redoc_url   = "/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
# Solo los orígenes listados pueden llamar al API desde el navegador.
# En producción se pueden añadir más con FRONTEND_ORIGINS (separados por coma).
_origins = [
    "http://localhost:3001",
    "http://localhost:3000",
    "http://127.0.0.1:3001",
    "https://majestic-biscuit-1790f6.netlify.app",
]
_origins += [o.strip() for o in os.getenv("FRONTEND_ORIGINS", "").split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins     = _origins,
    allow_credentials = False,          # la sesión viaja en la cabecera Authorization, no en cookies
    allow_methods     = ["GET", "POST"],
    allow_headers     = ["Authorization", "Content-Type"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(kpis.router)
app.include_router(puntos.router)
app.include_router(municipios.router)
app.include_router(alertas.router)
app.include_router(series.router)
app.include_router(auth.router)


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def root():
    return {
        "status":  "ok",
        "sistema": "Guajiragua BI Hidrogeológico",
        "version": "1.0.0",
        "endpoints": [
            "GET /api/kpis?temporada=Seca",
            "GET /api/puntos?temporada=Seca&muni=URI&tipo=Pozo",
            "GET /api/municipios?temporada=Seca",
            "GET /api/alertas?limit=50",
            "GET /api/series/ph?zona=Alta",
            "GET /docs  ← documentación interactiva",
        ],
    }


@app.get("/api/health", tags=["Health"])
def health():
    """Verifica que el API y la DB están vivos."""
    try:
        client = get_client()
        res = client.rpc("get_kpis", {"p_temporada": None}).execute()
        total = (res.data or {}).get("total", 0)
        return {"status": "ok", "mediciones_en_db": total}
    except Exception:
        logging.exception("health check falló")
        return {"status": "error", "detail": "Base de datos no disponible"}
