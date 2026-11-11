"""routers/municipios.py — Agregados por municipio"""

import logging
from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from database import get_client

router = APIRouter(prefix="/api/municipios", tags=["Municipios"])


@router.get("")
def get_municipios(temporada: Optional[str] = Query(None)):
    try:
        client = get_client()
        res = client.rpc("get_municipios", {"p_temporada": temporada}).execute()
        return res.data or []
    except Exception:
        logging.exception("Error en /api/municipios")
        raise HTTPException(status_code=500, detail="Error interno del servidor")
