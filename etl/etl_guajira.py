"""
etl_guajira.py
==============
Pipeline ETL — Sistema BI Hidrogeológico · La Guajira
Modelado dimensional (Kimball): extracción, transformación y carga

Flujo:
  FUENTE (CSV / Excel)  →  EXTRACCIÓN  →  TRANSFORMACIÓN  →  CARGA (DWH)

Ejecución:
  pip install pandas openpyxl
  python etl_guajira.py
"""

import sys, os
import pandas as pd

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "api"))
from calidad import clasificar_estado  # noqa: E402
from datetime import datetime

# Forzar UTF-8 en consola Windows (Python 3.7+)
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# ──────────────────────────────────────────────────────────────────────────────
# 0. CONFIGURACIÓN
# ──────────────────────────────────────────────────────────────────────────────
INPUT_FILE  = "datos_fuente_guajira.xlsx"   # archivo con datos crudos
OUTPUT_FILE = "dwh_guajira.xlsx"            # archivo de salida (Data Warehouse)

# Los umbrales de clasificación están en api/calidad.py (regla única del sistema).


# ──────────────────────────────────────────────────────────────────────────────
# 1. EXTRACCIÓN  (Extract)
# ──────────────────────────────────────────────────────────────────────────────
def extract(path: str) -> pd.DataFrame:
    """Lee el archivo de origen y devuelve un DataFrame crudo."""
    print(f"\n[E] Extrayendo datos desde: {path}")

    if not os.path.exists(path):
        # Si no existe el archivo, genera datos de muestra para demo
        print("    Archivo no encontrado — generando datos de muestra...")
        return _generar_datos_muestra()

    ext = os.path.splitext(path)[1].lower()
    if ext in (".xlsx", ".xls"):
        df = pd.read_excel(path, sheet_name=0)
    elif ext == ".csv":
        df = pd.read_csv(path, encoding="utf-8-sig")
    else:
        raise ValueError(f"Formato no soportado: {ext}")

    print(f"    {len(df):,} filas · {len(df.columns)} columnas extraídas")
    return df


def _generar_datos_muestra() -> pd.DataFrame:
    """Genera 350 registros de muestra que simulan mediciones IDEAM."""
    import random, math
    random.seed(42)

    municipios = [
        ("URI", "Uribia",          "Alta",  11.71, -72.27),
        ("MAN", "Manaure",         "Alta",  11.78, -72.45),
        ("MAI", "Maicao",          "Alta",  11.38, -72.24),
        ("RIO", "Riohacha",        "Media", 11.54, -72.91),
        ("ALB", "Albania",         "Media", 11.14, -72.54),
        ("DIB", "Dibulla",         "Media", 11.27, -73.34),
        ("HAT", "Hatonuevo",       "Baja",  11.07, -72.77),
        ("BAR", "Barrancas",       "Baja",  10.96, -72.79),
        ("SJC", "San Juan del Cesar","Baja",10.77, -73.00),
        ("FON", "Fonseca",         "Baja",  10.89, -72.85),
        ("DIS", "Distracción",     "Baja",  10.82, -72.92),
    ]
    tipos  = ["Pozo", "Manantial", "Quebrada", "Embalse"]
    usos   = ["Consumo", "Riego", "Industrial"]
    epocas = [
        ("Seca",   "2026-02-15"),
        ("Húmeda", "2025-10-20"),
    ]

    rows = []
    pt_id = 1
    for muni_id, muni_nom, zona, lat, lon in municipios:
        n_pts = random.randint(25, 40)
        for i in range(n_pts):
            tipo = random.choice(tipos)
            uso  = random.choice(usos)
            for temporada, fecha_str in epocas:
                # Valores con variación estacional realista
                factor = 1.15 if temporada == "Seca" else 1.0
                ph    = round(random.uniform(7.0, 7.5) * (1 / factor ** 0.1), 3)
                sal   = round(random.uniform(0.4, 2.1) * factor, 3)
                cond  = round(random.uniform(1300, 3800) * factor, 1)
                temp  = round(random.uniform(29.0, 32.5) + (1.5 if temporada == "Seca" else 0), 2)
                std   = round(cond * random.uniform(0.55, 0.65), 1)
                prof  = round(random.uniform(2.0, 45.0), 1) if tipo == "Pozo" else 0.0

                rows.append({
                    "id_medicion":   f"MED-{pt_id:04d}-{temporada[:3].upper()}",
                    "fecha":         fecha_str,
                    "temporada":     temporada,
                    "id_punto":      f"PT-{muni_id}-{i+1:02d}",
                    "codigo_punto":  f"{muni_id}{i+1:02d}",
                    "tipo":          tipo,
                    "uso":           uso,
                    "latitud":       round(lat + random.uniform(-0.05, 0.05), 5),
                    "longitud":      round(lon + random.uniform(-0.05, 0.05), 5),
                    "id_municipio":  muni_id,
                    "municipio":     muni_nom,
                    "zona":          zona,
                    "ph":            ph,
                    "conductividad": cond,
                    "salinidad":     sal,
                    "temperatura":   temp,
                    "std_mg_l":      std,
                    "profundidad_m": prof,
                    "activo":        random.random() > 0.05,
                })
                pt_id += 1

    df = pd.DataFrame(rows)
    print(f"    {len(df):,} registros de muestra generados")
    return df


# ──────────────────────────────────────────────────────────────────────────────
# 2. TRANSFORMACIÓN  (Transform)
# ──────────────────────────────────────────────────────────────────────────────
def transform(df: pd.DataFrame) -> dict[str, pd.DataFrame]:
    """
    Limpia, enriquece y construye las tablas del modelo estrella.
    Retorna un dict  { nombre_hoja: DataFrame }.
    """
    print("\n[T] Iniciando transformaciones...")

    df = df.copy()

    # 2.1 — Normalizar nombres de columnas
    df.columns = (df.columns
                    .str.strip()
                    .str.lower()
                    .str.replace(" ", "_")
                    .str.replace("é", "e")
                    .str.replace("ú", "u")
                    .str.replace("ó", "o"))

    # 2.2 — Tipos de dato
    df["fecha"] = pd.to_datetime(df["fecha"], errors="coerce")
    for col in ["ph", "conductividad", "salinidad", "temperatura",
                "std_mg_l", "profundidad_m"]:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    n_antes = len(df)

    # 2.3 — Eliminar duplicados exactos
    df = df.drop_duplicates()
    print(f"    Duplicados eliminados: {n_antes - len(df)}")

    # 2.4 — Filtrar valores fuera de rango físico imposible
    out_ph   = df["ph"].notna() & ((df["ph"] < 0) | (df["ph"] > 14))
    out_sal  = df["salinidad"].notna() & (df["salinidad"] < 0)
    out_cond = df["conductividad"].notna() & (df["conductividad"] < 0)
    out_temp = df["temperatura"].notna() & ((df["temperatura"] < 0) | (df["temperatura"] > 50))
    outliers = out_ph | out_sal | out_cond | out_temp
    print(f"    Outliers físicos eliminados: {outliers.sum()}")
    df = df[~outliers].copy()

    # 2.5 — Valores ausentes
    # Las variables fisicoquímicas no se imputan: un valor ausente queda como
    # nulo y se excluye de los promedios. Un 0 en salinidad, STD o temperatura
    # indica que el sensor no registró el dato.
    for col in ["salinidad", "std_mg_l", "temperatura"]:
        if col in df.columns:
            n_cero = int((df[col] == 0).sum())
            df.loc[df[col] == 0, col] = None
            if n_cero:
                print(f"    Ceros convertidos a nulo en '{col}': {n_cero}")

    # 2.6 — Clasificar estado con la regla única del sistema (api/calidad.py)
    def _num(v):
        return None if pd.isna(v) else float(v)

    def clasificar(row):
        return clasificar_estado(_num(row.get("ph")),
                                 _num(row.get("conductividad")),
                                 _num(row.get("salinidad")))

    df["estado"] = df.apply(clasificar, axis=1)

    # 2.7 — Dimensión Tiempo
    df["anio"]      = df["fecha"].dt.year
    df["mes"]       = df["fecha"].dt.month
    df["trimestre"] = df["fecha"].dt.quarter.map(lambda q: f"Q{q}")
    df["nombre_mes"] = df["fecha"].dt.strftime("%B")

    print(f"    Registros limpios: {len(df):,}")

    # ── Construir tablas dimensionales ────────────────────────────────────────

    # DIM_TIEMPO
    dim_tiempo = (df[["fecha", "anio", "mes", "trimestre", "nombre_mes", "temporada"]]
                  .drop_duplicates()
                  .sort_values("fecha")
                  .reset_index(drop=True))
    dim_tiempo.insert(0, "id_tiempo", range(1, len(dim_tiempo) + 1))

    # DIM_MUNICIPIO
    dim_muni_cols = ["id_municipio", "municipio", "zona"]
    if "codigo_dane" in df.columns:
        dim_muni_cols.append("codigo_dane")
    dim_municipio = (df[dim_muni_cols]
                     .drop_duplicates("id_municipio")
                     .sort_values("id_municipio")
                     .reset_index(drop=True))
    if "activo" in df.columns:
        activo_map = df.groupby("id_municipio")["activo"].max()
        dim_municipio["activo"] = dim_municipio["id_municipio"].map(activo_map)

    # DIM_PUNTO
    punto_cols = [c for c in ["id_punto", "codigo_punto", "tipo", "uso",
                               "latitud", "longitud"] if c in df.columns]
    dim_punto = (df[punto_cols]
                 .drop_duplicates("id_punto")
                 .sort_values("id_punto")
                 .reset_index(drop=True))

    # Merge id_tiempo en FACT
    df = df.merge(dim_tiempo[["id_tiempo", "fecha", "temporada"]],
                  on=["fecha", "temporada"], how="left")

    # FACT_MEDICION
    fact_cols = [c for c in [
        "id_medicion", "id_punto", "id_municipio", "id_tiempo",
        "ph", "conductividad", "salinidad", "temperatura",
        "std_mg_l", "profundidad_m", "estado"
    ] if c in df.columns]
    fact_medicion = df[fact_cols].reset_index(drop=True)

    # KPIs resumen
    total = len(fact_medicion)
    kpis = pd.DataFrame([
        {"KPI": "Total mediciones",        "Valor": total,
         "Unidad": "registros"},
        {"KPI": "Puntos de monitoreo",     "Valor": dim_punto["id_punto"].nunique(),
         "Unidad": "puntos"},
        {"KPI": "Municipios cubiertos",    "Valor": dim_municipio["id_municipio"].nunique(),
         "Unidad": "municipios"},
        {"KPI": "% Aptas",                 "Valor": round(
             (fact_medicion["estado"] == "Apta").sum() / total * 100, 1),
         "Unidad": "%"},
        {"KPI": "% Precaución",            "Valor": round(
             (fact_medicion["estado"] == "Precaución").sum() / total * 100, 1),
         "Unidad": "%"},
        {"KPI": "% Críticas",              "Valor": round(
             (fact_medicion["estado"] == "Crítico").sum() / total * 100, 1),
         "Unidad": "%"},
        {"KPI": "pH promedio global",      "Valor": round(fact_medicion["ph"].mean(), 3),
         "Unidad": "unidades"},
        {"KPI": "Conductividad promedio",  "Valor": round(fact_medicion["conductividad"].mean(), 1),
         "Unidad": "µS/cm"},
        {"KPI": "Salinidad promedio",      "Valor": round(fact_medicion["salinidad"].mean(), 3),
         "Unidad": "mS/cm"},
        {"KPI": "Temperatura promedio",    "Valor": round(fact_medicion["temperatura"].mean(), 2),
         "Unidad": "°C"},
    ])

    return {
        "FACT_MEDICION":  fact_medicion,
        "DIM_MUNICIPIO":  dim_municipio,
        "DIM_PUNTO":      dim_punto,
        "DIM_TIEMPO":     dim_tiempo,
        "KPIs_RESUMEN":   kpis,
    }


# ──────────────────────────────────────────────────────────────────────────────
# 3. CARGA  (Load)
# ──────────────────────────────────────────────────────────────────────────────
def load(tablas: dict[str, pd.DataFrame], output_path: str) -> None:
    """Escribe todas las tablas en un archivo Excel con formato."""
    print(f"\n[L] Cargando {len(tablas)} tablas → {output_path}")

    HEADER_COLORS = {
        "FACT_MEDICION": "C97A2B",
        "DIM_MUNICIPIO": "2C5FA6",
        "DIM_PUNTO":     "2C5FA6",
        "DIM_TIEMPO":    "2C5FA6",
        "KPIs_RESUMEN":  "2E8B57",
    }

    with pd.ExcelWriter(output_path, engine="openpyxl") as writer:
        for nombre, df in tablas.items():
            df.to_excel(writer, sheet_name=nombre, index=False)

            # Formato de encabezados
            try:
                from openpyxl.styles import PatternFill, Font, Alignment
                ws = writer.sheets[nombre]
                color = HEADER_COLORS.get(nombre, "444444")
                fill  = PatternFill("solid", fgColor=color)
                font  = Font(bold=True, color="FFFFFF", size=11)
                for cell in ws[1]:
                    cell.fill      = fill
                    cell.font      = font
                    cell.alignment = Alignment(horizontal="center")

                # Ajuste de ancho automático
                for col in ws.columns:
                    max_len = max(
                        (len(str(cell.value)) if cell.value else 0 for cell in col),
                        default=10
                    )
                    ws.column_dimensions[col[0].column_letter].width = min(max_len + 4, 40)
            except ImportError:
                pass  # openpyxl disponible pero sin estilos avanzados

            print(f"    ✓  {nombre:<20} {len(df):>5,} filas · {len(df.columns)} columnas")

    print(f"\n    Archivo generado: {os.path.abspath(output_path)}")


# ──────────────────────────────────────────────────────────────────────────────
# 4. PIPELINE COMPLETO
# ──────────────────────────────────────────────────────────────────────────────
def run_pipeline():
    t0 = datetime.now()
    print("=" * 60)
    print("  ETL — Sistema BI Hidrogeológico · La Guajira")
    print(f"  Inicio: {t0.strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    df_raw  = extract(INPUT_FILE)
    tablas  = transform(df_raw)
    load(tablas, OUTPUT_FILE)

    elapsed = (datetime.now() - t0).total_seconds()
    print(f"\n  Pipeline completado en {elapsed:.2f} s")
    print("=" * 60)

    # Mostrar KPIs en consola
    print("\n  KPIs del Data Warehouse:")
    print(tablas["KPIs_RESUMEN"].to_string(index=False))
    print()


if __name__ == "__main__":
    run_pipeline()
