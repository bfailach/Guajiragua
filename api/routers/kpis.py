"""routers/kpis.py — KPIs globales"""

import logging
from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from database import get_client

router = APIRouter(prefix="/api/kpis", tags=["KPIs"])


@router.get("")
def get_kpis(temporada: Optional[str] = Query(None, description="Seca | Húmeda")):
    try:
        client = get_client()
        res = client.rpc("get_kpis", {"p_temporada": temporada}).execute()
        row = res.data

        total    = row.get("total")    or 0
        activos  = row.get("activos")  or 0
        criticos = row.get("criticos") or 0
        aptos    = row.get("aptos")    or 0
        ph       = float(row.get("ph_promedio")   or 0)
        sal      = float(row.get("sal_promedio")  or 0)
        cond     = float(row.get("cond_promedio") or 0)

        cobertura = round(100 * activos / max(total, 1), 1)
        k_ph      = min(1.0, max(0.0, (ph - 5.8) / (8.5 - 5.8)))
        iph       = round(100 * (aptos / max(total, 1)) * k_ph, 1)
        ida       = round(min(100, (sal / 3.5) * 50 + (cond / 5000) * 50), 1)

        return {
            "total":        total,
            "activos":      activos,
            "criticos":     criticos,
            "precaucion":   row.get("precaucion") or 0,
            "aptos":        aptos,
            "coberturaPct": cobertura,
            "phPromedio":   ph,
            "condPromedio": cond,
            "salPromedio":  sal,
            "tempPromedio": float(row.get("temp_promedio") or 0),
            "iph":          iph,
            "ida":          ida,
        }
    except Exception:
        logging.exception("Error en /api/kpis")
        raise HTTPException(status_code=500, detail="Error interno del servidor")
