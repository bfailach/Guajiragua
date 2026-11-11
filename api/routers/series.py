"""routers/series.py — Series temporales"""

import logging
from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from database import get_client

router = APIRouter(prefix="/api/series", tags=["Series"])

MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"]

SHAPE = {
    "ph":   {"seca":[0.993,1.000,1.008,1.015,1.010,None,None,None,None,None,0.989,0.995],
             "hum": [None,None,None,None,None,0.984,0.988,0.992,0.997,1.000,None,None]},
    "sal":  {"seca":[1.08,1.00,0.97,0.93,0.95,None,None,None,None,None,1.04,1.10],
             "hum": [None,None,None,None,None,0.72,0.69,0.71,0.76,1.00,None,None]},
    "cond": {"seca":[1.06,1.00,0.98,0.96,0.97,None,None,None,None,None,1.03,1.07],
             "hum": [None,None,None,None,None,0.75,0.72,0.74,0.78,1.00,None,None]},
    "temp": {"seca":[1.005,1.000,1.012,1.018,1.020,None,None,None,None,None,1.003,1.001],
             "hum": [None,None,None,None,None,0.960,0.955,0.958,0.965,1.000,None,None]},
}


@router.get("/{variable}")
def get_series(variable: str, zona: Optional[str] = Query(None)):
    if variable not in SHAPE:
        raise HTTPException(status_code=400, detail=f"Variable no válida. Use: {list(SHAPE)}")
    try:
        client = get_client()
        res    = client.rpc("get_serie_base", {"p_variable": variable, "p_zona": zona}).execute()
        bases  = res.data or {}

        base_seca = float(bases.get("base_seca") or 0)
        base_hum  = float(bases.get("base_hum")  or 0)
        shape     = SHAPE[variable]

        return {
            "variable":  variable,
            "zona":      zona or "Todas",
            "meses":     MESES,
            "seca":      [round(base_seca * f, 4) if f else None for f in shape["seca"]],
            "humeda":    [round(base_hum  * f, 4) if f else None for f in shape["hum"]],
            "base_seca": base_seca,
            "base_hum":  base_hum,
        }
    except Exception:
        logging.exception("Error en /api/series")
        raise HTTPException(status_code=500, detail="Error interno del servidor")
