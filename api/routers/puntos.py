"""routers/puntos.py — Puntos de monitoreo con filtros"""

from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from database import get_client

router = APIRouter(prefix="/api/puntos", tags=["Puntos"])


@router.get("")
def get_puntos(
    temporada: Optional[str] = Query(None),
    muni:      Optional[str] = Query(None),
    tipo:      Optional[str] = Query(None),
    estado:    Optional[str] = Query(None),
    zona:      Optional[str] = Query(None),
    limit:     int           = Query(500, ge=1, le=5000),
    offset:    int           = Query(0,   ge=0),
):
    try:
        client = get_client()

        # Selección con relaciones embebidas (PostgREST)
        q = client.table("fact_medicion").select(
            "id_medicion, ph, conductividad, salinidad, temperatura, std_mg_l, estado, "
            "dim_punto!inner(id_punto, tipo, uso, metodo, lat, lon, prof_m, activo, id_municipio), "
            "dim_tiempo!inner(fecha, temporada), "
            "dim_municipio!inner(nombre, zona)"
        )

        if temporada: q = q.eq("dim_tiempo.temporada", temporada)
        if muni:      q = q.eq("dim_punto.id_municipio", muni)
        if tipo:      q = q.eq("dim_punto.tipo", tipo)
        if estado:    q = q.eq("estado", estado)
        if zona:      q = q.eq("dim_municipio.zona", zona)

        q   = q.range(offset, offset + limit - 1)
        res = q.execute()

        # Aplanar estructura anidada para que el frontend la consuma igual que real-data.js
        data = []
        for r in (res.data or []):
            p  = r.get("dim_punto",     {})
            t  = r.get("dim_tiempo",    {})
            m  = r.get("dim_municipio", {})
            data.append({
                "id":        r["id_medicion"],
                "muni":      p.get("id_municipio"),
                "muniName":  m.get("nombre"),
                "zona":      m.get("zona"),
                "tipo":      p.get("tipo"),
                "uso":       p.get("uso"),
                "metodo":    p.get("metodo"),
                "temporada": t.get("temporada"),
                "fecha":     t.get("fecha"),
                "lat":       p.get("lat"),
                "lon":       p.get("lon"),
                "prof":      p.get("prof_m"),
                "activo":    p.get("activo"),
                "ph":        r.get("ph"),
                "cond":      r.get("conductividad"),
                "sal":       r.get("salinidad"),
                "temp":      r.get("temperatura"),
                "std":       r.get("std_mg_l"),
                "estado":    r.get("estado"),
            })

        return {"total": len(data), "limit": limit, "offset": offset, "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
