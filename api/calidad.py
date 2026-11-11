"""
calidad.py — Regla única de clasificación de calidad del agua
Guajiragua · Sistema BI Hidrogeológico

Es la referencia para todo el sistema: la carga a Supabase, el ETL y la API
la usan desde aquí. El frontend replica la misma regla en `clasificarEstado`
(mock-data.jsx); si se cambia un umbral, debe cambiarse en ambos lugares.

    Crítico     conductividad > 5000 µS/cm, salinidad > 4.0 mS/cm,
                pH < 6.0 o pH > 9.0
    Precaución  conductividad > 2500 µS/cm, pH < 6.5 o pH > 8.5
    Apta        en otro caso

Un valor ausente (None) no activa ningún criterio.
"""

from typing import Optional

APTA = "Apta"
PRECAUCION = "Precaución"
CRITICO = "Crítico"
ESTADOS = (APTA, PRECAUCION, CRITICO)

UMBRALES = {
    "critico": {"cond_max": 5000.0, "sal_max": 4.0, "ph_min": 6.0, "ph_max": 9.0},
    "precaucion": {"cond_max": 2500.0, "ph_min": 6.5, "ph_max": 8.5},
}


def _mayor(valor: Optional[float], limite: float) -> bool:
    return valor is not None and valor > limite


def _menor(valor: Optional[float], limite: float) -> bool:
    return valor is not None and valor < limite


def clasificar_estado(
    ph: Optional[float],
    conductividad: Optional[float],
    salinidad: Optional[float] = None,
) -> str:
    c = UMBRALES["critico"]
    if (_mayor(conductividad, c["cond_max"]) or _mayor(salinidad, c["sal_max"])
            or _menor(ph, c["ph_min"]) or _mayor(ph, c["ph_max"])):
        return CRITICO

    p = UMBRALES["precaucion"]
    if (_mayor(conductividad, p["cond_max"])
            or _menor(ph, p["ph_min"]) or _mayor(ph, p["ph_max"])):
        return PRECAUCION

    return APTA
