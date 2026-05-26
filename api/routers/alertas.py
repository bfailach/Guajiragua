"""routers/alertas.py — Alertas activas"""

from fastapi import APIRouter, Query, HTTPException
from database import get_client

router = APIRouter(prefix="/api/alertas", tags=["Alertas"])


@router.get("")
def get_alertas(limit: int = Query(50, ge=1, le=500)):
    try:
        client = get_client()
        res = client.rpc("get_alertas", {"p_limit": limit}).execute()
        rows = res.data or []

        alertas = []
        for i, r in enumerate(rows):
            sal  = float(r.get("salinidad")     or 0)
            cond = float(r.get("conductividad") or 0)
            ph   = float(r.get("ph")            or 7)

            alertas.append({
                "id":    f"AL-2026-{str(i+1).zfill(4)}",
                "sev":   r.get("severidad"),
                "code":  r.get("codigo"),
                "body":  _body(r, sal, cond, ph),
                "muni":  r.get("muni"),
                "point": r.get("id_punto"),
                "time":  r.get("fecha"),
                "value": _value(sal, cond, ph),
            })

        return alertas
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def _body(r, sal, cond, ph):
    pid  = r.get("id_punto", "")
    tipo = r.get("tipo", "")
    if sal  > 4.0:  return f"Salinidad {sal} mS/cm en {pid} ({tipo})"
    if cond > 5000: return f"Conductividad {cond} µS/cm en {pid}"
    if ph   < 6.0:  return f"pH ácido {ph} en {pid} ({tipo})"
    if ph   > 9.0:  return f"pH alcalino {ph} en {pid}"
    return f"Parámetros en precaución · {pid}"


def _value(sal, cond, ph):
    if sal  > 4.0:  return str(sal)
    if cond > 5000: return str(cond)
    return str(ph)
