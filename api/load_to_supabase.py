"""
load_to_supabase.py — Carga los 1.735 puntos reales a Supabase
Ejecutar UNA SOLA VEZ después de correr schema.sql y create_functions.sql.

    cd api
    python load_to_supabase.py
"""

import sys, os, re, json
from datetime import date
from dotenv import load_dotenv

load_dotenv()
sys.path.insert(0, os.path.dirname(__file__))
from database import get_client
from calidad import clasificar_estado

REAL_DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "real-data.js")

MUNI_COORDS = {
    "URI":(11.71,-72.27),"MAN":(11.78,-72.45),"MAI":(11.39,-72.24),
    "RIO":(11.54,-72.91),"ALB":(11.16,-72.59),"DIB":(11.27,-73.30),
    "HAT":(11.07,-72.76),"BAR":(10.96,-72.79),"SJC":(10.77,-73.00),
    "FON":(10.89,-72.85),"DIS":(10.90,-72.90),
}
MUNI_DANES = {
    "URI":"44847","MAN":"44560","MAI":"44430","RIO":"44001","ALB":"44035",
    "DIB":"44090","HAT":"44378","BAR":"44078","SJC":"44650","FON":"44279","DIS":"44098",
}
CAMPANAS = {"Seca": "2026-02-18", "Húmeda": "2025-10-22"}


def load_real_data():
    print(f"[E] Leyendo {REAL_DATA_PATH} ...")
    with open(REAL_DATA_PATH, encoding="utf-8") as f:
        content = f.read()
    match = re.search(r'window\.GJ_REAL_POINTS\s*=\s*(\[.*\])', content, re.DOTALL)
    if not match:
        raise ValueError("No se encontró window.GJ_REAL_POINTS en real-data.js")
    points = json.loads(match.group(1))
    print(f"    {len(points):,} puntos extraídos")
    return points


def build_tables(points):
    municipios, puntos, hechos = {}, {}, []

    for p in points:
        mid = p["muni"]
        if mid not in municipios:
            lat, lon = MUNI_COORDS.get(mid, (0, 0))
            municipios[mid] = {
                "id_municipio": mid,
                "nombre":       p["muniName"],
                "zona":         p["zona"],
                "lat":          lat, "lon": lon,
                "codigo_dane":  MUNI_DANES.get(mid, ""),
            }

        pid = p["id"]
        if pid not in puntos:
            puntos[pid] = {
                "id_punto":     pid,
                "id_municipio": mid,
                "tipo":         p.get("tipo", "Pozo"),
                "uso":          p.get("uso", "Doméstico"),
                "metodo":       p.get("metodo", "Sonda multiparámetro"),
                "lat":          p.get("lat"),
                "lon":          p.get("lon"),
                "prof_m":       p.get("prof"),
                "activo":       p.get("activo", True),
            }

        temp  = p["temporada"]
        fecha = CAMPANAS.get(temp, "2026-01-01")
        suf   = "S" if temp == "Seca" else "H"

        hechos.append({
            "id_medicion":  pid + "-" + suf,
            "id_punto":     pid,
            "id_municipio": mid,
            "fecha":        fecha,
            "temporada":    temp,
            "ph":           p.get("ph"),
            "conductividad":p.get("cond"),
            "salinidad":    p.get("sal"),
            "temperatura":  p.get("temp"),
            "std_mg_l":     p.get("std"),
            "estado":       clasificar_estado(p.get("ph"), p.get("cond"), p.get("sal")),
        })

    return list(municipios.values()), list(puntos.values()), hechos


def upsert_batch(client, table, rows, chunk=200):
    total = 0
    for i in range(0, len(rows), chunk):
        chunk_rows = rows[i:i+chunk]
        client.table(table).upsert(chunk_rows, on_conflict="id_municipio" if table == "dim_municipio"
                                   else "id_punto" if table == "dim_punto"
                                   else "id_medicion").execute()
        total += len(chunk_rows)
        print(f"    {table}: {total}/{len(rows)}", end="\r")
    print()
    return total


def load_tiempos(client):
    """Inserta los 2 registros de dim_tiempo (seca + húmeda)."""
    rows = [
        {"fecha":"2026-02-18","anio":2026,"mes":2,"trimestre":"Q1","nombre_mes":"February","temporada":"Seca"},
        {"fecha":"2025-10-22","anio":2025,"mes":10,"trimestre":"Q4","nombre_mes":"October","temporada":"Húmeda"},
    ]
    client.table("dim_tiempo").upsert(rows, on_conflict="fecha,temporada").execute()
    res   = client.table("dim_tiempo").select("id_tiempo,fecha,temporada").execute()
    t_map = {(r["fecha"], r["temporada"]): r["id_tiempo"] for r in res.data}
    print(f"    dim_tiempo: 2 registros · ids: {t_map}")
    return t_map


def enrich_hechos(hechos, t_map):
    """Sustituye fecha+temporada por id_tiempo."""
    enriched = []
    for h in hechos:
        key = (h.pop("fecha"), h.pop("temporada"))
        tid = t_map.get(key)
        if tid is None:
            print(f"  ⚠ Sin id_tiempo para {key}, skip {h['id_medicion']}")
            continue
        h["id_tiempo"] = tid
        enriched.append(h)
    return enriched


if __name__ == "__main__":
    print("=" * 60)
    print("  Guajiragua — Carga a Supabase (HTTPS)")
    print("=" * 60)

    points = load_real_data()
    municipios, puntos_d, hechos = build_tables(points)

    print(f"\n  Tablas preparadas:")
    print(f"    dim_municipio : {len(municipios)} filas")
    print(f"    dim_punto     : {len(puntos_d)} filas")
    print(f"    fact_medicion : {len(hechos)} filas")

    client = get_client()
    print("\n[L] Cargando...")

    print("  >> dim_municipio"); upsert_batch(client, "dim_municipio", municipios)
    print("  >> dim_punto");     upsert_batch(client, "dim_punto",     puntos_d)
    print("  >> dim_tiempo");    t_map = load_tiempos(client)

    hechos = enrich_hechos(hechos, t_map)
    print("  >> fact_medicion"); upsert_batch(client, "fact_medicion", hechos)

    print("\n  ✓  Carga completada. Verifica en Supabase → Table Editor.")
    print("=" * 60)
