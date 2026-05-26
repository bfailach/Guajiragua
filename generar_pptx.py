"""
generar_pptx.py
===============
Genera la presentación PowerPoint de sustentación (Fase 7)
Proyecto Final — UMB · Inteligencia de Negocios

Ejecución:
  python generar_pptx.py
"""

import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

from pptx import Presentation
from pptx.util import Inches, Pt, Cm, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.util import Inches, Pt
import datetime

# ── Paleta ────────────────────────────────────────────────────────────────────
AMBER  = RGBColor(0xC9, 0x7A, 0x2B)
BLUE   = RGBColor(0x2C, 0x5F, 0xA6)
GREEN  = RGBColor(0x2E, 0x8B, 0x57)
RED    = RGBColor(0xB5, 0x40, 0x3D)
DARK   = RGBColor(0x1A, 0x1A, 0x1A)
GRAY   = RGBColor(0x55, 0x55, 0x55)
LGRAY  = RGBColor(0xF0, 0xF2, 0xF5)
WHITE  = RGBColor(0xFF, 0xFF, 0xFF)
BG     = RGBColor(0xF4, 0xF5, 0xF7)

# ── Helpers ───────────────────────────────────────────────────────────────────
W = Inches(13.33)   # widescreen 16:9
H = Inches(7.5)

def new_slide(prs, layout_idx=6):
    """Añade slide en blanco."""
    layout = prs.slide_layouts[layout_idx]
    return prs.slides.add_slide(layout)

def bg(slide, color):
    """Fondo sólido."""
    fill = slide.background.fill
    fill.solid()
    fill.fore_color.rgb = color

def box(slide, x, y, w, h, fill_color=None, border_color=None, border_width=Pt(0)):
    """Rectángulo de fondo."""
    shape = slide.shapes.add_shape(1, x, y, w, h)  # MSO_SHAPE_TYPE.RECTANGLE
    shape.line.fill.background()
    if fill_color:
        shape.fill.solid()
        shape.fill.fore_color.rgb = fill_color
    else:
        shape.fill.background()
    if border_color:
        shape.line.color.rgb = border_color
        shape.line.width = border_width
    else:
        shape.line.fill.background()
    return shape

def txt(slide, text, x, y, w, h,
        size=24, bold=False, italic=False,
        color=DARK, align=PP_ALIGN.LEFT,
        wrap=True, font='Calibri'):
    """Cuadro de texto."""
    txBox = slide.shapes.add_textbox(x, y, w, h)
    tf    = txBox.text_frame
    tf.word_wrap = wrap
    p  = tf.paragraphs[0]
    p.alignment = align
    run = p.add_run()
    run.text = text
    run.font.name  = font
    run.font.size  = Pt(size)
    run.font.bold  = bold
    run.font.italic = italic
    run.font.color.rgb = color
    return txBox

def txt_lines(slide, lines, x, y, w, h,
              size=18, color=DARK, align=PP_ALIGN.LEFT,
              line_space=Pt(4), font='Calibri'):
    """Cuadro de texto multilínea (lista de tuplas (text, bold, color_override))."""
    txBox = slide.shapes.add_textbox(x, y, w, h)
    tf    = txBox.text_frame
    tf.word_wrap = True
    for i, item in enumerate(lines):
        if isinstance(item, str):
            text, bold, clr = item, False, color
        else:
            text = item[0]
            bold = item[1] if len(item) > 1 else False
            clr  = item[2] if len(item) > 2 else color
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        p.space_after = line_space
        run = p.add_run()
        run.text = text
        run.font.name  = font
        run.font.size  = Pt(size)
        run.font.bold  = bold
        run.font.color.rgb = clr
    return txBox

def slide_num(slide, n, total):
    txt(slide, f'{n} / {total}',
        W - Inches(1.2), H - Inches(0.4),
        Inches(1.0), Inches(0.3),
        size=9, color=RGBColor(0xAA,0xAA,0xAA),
        align=PP_ALIGN.RIGHT)

def header_bar(slide, title, subtitle='', color=BLUE):
    """Barra de título superior."""
    box(slide, 0, 0, W, Inches(1.35), fill_color=color)
    txt(slide, title,
        Inches(0.4), Inches(0.08), W - Inches(0.8), Inches(0.75),
        size=28, bold=True, color=WHITE, align=PP_ALIGN.LEFT)
    if subtitle:
        txt(slide, subtitle,
            Inches(0.4), Inches(0.78), W - Inches(0.8), Inches(0.45),
            size=13, color=RGBColor(0xDD,0xDD,0xFF), align=PP_ALIGN.LEFT)

def kpi_card(slide, x, y, w, h, label, value, unit='', delta='',
             bg_color=BLUE, val_color=WHITE):
    """Tarjeta KPI pequeña."""
    box(slide, x, y, w, h, fill_color=bg_color)
    txt(slide, label, x + Inches(0.12), y + Inches(0.08),
        w - Inches(0.2), Inches(0.32),
        size=10, color=RGBColor(0xCC,0xCC,0xFF) if bg_color == BLUE else WHITE,
        align=PP_ALIGN.LEFT)
    txt(slide, value, x + Inches(0.12), y + Inches(0.35),
        w - Inches(0.2), Inches(0.52),
        size=26, bold=True, color=val_color, align=PP_ALIGN.LEFT)
    if unit:
        txt(slide, unit, x + Inches(0.12), y + Inches(0.82),
            w - Inches(0.2), Inches(0.25),
            size=10, color=RGBColor(0xDD,0xDD,0xDD), align=PP_ALIGN.LEFT)
    if delta:
        txt(slide, delta, x + w - Inches(1.1), y + Inches(0.1),
            Inches(1.0), Inches(0.3),
            size=10, bold=True,
            color=GREEN if delta.startswith('▲') else RED,
            align=PP_ALIGN.RIGHT)

def bullet_list(slide, items, x, y, w,
                size=16, color=DARK, marker='•', gap=Inches(0.38)):
    """Lista de viñetas manual."""
    for i, item in enumerate(items):
        if isinstance(item, tuple):
            line_text = item[0]
            line_color = item[1] if len(item) > 1 else color
            line_bold  = item[2] if len(item) > 2 else False
        else:
            line_text  = item
            line_color = color
            line_bold  = False
        txt(slide, marker, x, y + i * gap,
            Inches(0.3), Inches(0.35), size=size, color=AMBER)
        txt(slide, line_text, x + Inches(0.3), y + i * gap,
            w - Inches(0.3), Inches(0.38),
            size=size, color=line_color, bold=line_bold)


# ── Presentación ──────────────────────────────────────────────────────────────
prs = Presentation()
prs.slide_width  = W
prs.slide_height = H

TOTAL = 14

# ─────────────────────────────────────────────────────────────────────────────
# SLIDE 1 — PORTADA
# ─────────────────────────────────────────────────────────────────────────────
s = new_slide(prs)
bg(s, DARK)

# Franja ámbar izquierda
box(s, 0, 0, Inches(0.55), H, fill_color=AMBER)

# Franja azul inferior
box(s, 0, H - Inches(1.1), W, Inches(1.1), fill_color=BLUE)

txt(s, 'GUAJIRAGUA', Inches(0.9), Inches(1.2), Inches(10), Inches(1.8),
    size=72, bold=True, color=AMBER, align=PP_ALIGN.LEFT)

txt(s, 'Sistema de Inteligencia de Negocios Hidrogeológico',
    Inches(0.9), Inches(2.85), Inches(9), Inches(0.6),
    size=22, color=WHITE, align=PP_ALIGN.LEFT)

txt(s, 'Departamento de La Guajira, Colombia',
    Inches(0.9), Inches(3.4), Inches(9), Inches(0.5),
    size=18, color=RGBColor(0xBB,0xBB,0xBB), align=PP_ALIGN.LEFT, italic=True)

# Línea divisora
box(s, Inches(0.9), Inches(3.95), Inches(7), Inches(0.05), fill_color=AMBER)

txt(s, 'Universidad Manuela Beltrán  ·  Ingeniería de Negocios  ·  2025-II / 2026-I',
    Inches(0.9), Inches(4.15), Inches(10), Inches(0.4),
    size=13, color=RGBColor(0x99,0x99,0x99), align=PP_ALIGN.LEFT)

txt(s, f'Bryan Failach  ·  {datetime.date.today().strftime("%B %Y")}',
    Inches(0.9), Inches(4.6), Inches(10), Inches(0.4),
    size=14, bold=True, color=WHITE, align=PP_ALIGN.LEFT)

txt(s, '732 mediciones  ·  11 municipios  ·  2 épocas  ·  366 puntos de monitoreo',
    Inches(0.5), H - Inches(0.8), W - Inches(1.0), Inches(0.5),
    size=12, color=RGBColor(0xCC,0xCC,0xFF), align=PP_ALIGN.LEFT)

slide_num(s, 1, TOTAL)


# ─────────────────────────────────────────────────────────────────────────────
# SLIDE 2 — AGENDA
# ─────────────────────────────────────────────────────────────────────────────
s = new_slide(prs)
bg(s, BG)
header_bar(s, 'Contenido de la presentación', 'GUAJIRAGUA · Proyecto Final', DARK)

items = [
    ('Contexto y problema',              BLUE,  True),
    ('Metodología y stack tecnológico',  BLUE,  True),
    ('Modelo dimensional estrella',      BLUE,  True),
    ('Pipeline ETL',                     BLUE,  True),
    ('Dashboard interactivo — 6 páginas',BLUE,  True),
    ('Análisis de hallazgos',            AMBER, True),
    ('KPIs estratégicos',                AMBER, True),
    ('Recomendaciones y conclusiones',   AMBER, True),
]

col1 = items[:4]
col2 = items[4:]
GAP  = Inches(0.54)

for i, (label, color, bold) in enumerate(col1):
    box(s, Inches(0.5), Inches(1.6) + i*GAP, Inches(0.08), Inches(0.35), fill_color=color)
    txt(s, f'0{i+1}   {label}',
        Inches(0.72), Inches(1.58) + i*GAP, Inches(5.5), Inches(0.42),
        size=16, color=DARK, bold=bold)

for i, (label, color, bold) in enumerate(col2):
    box(s, Inches(7.1), Inches(1.6) + i*GAP, Inches(0.08), Inches(0.35), fill_color=color)
    txt(s, f'0{i+5}   {label}',
        Inches(7.32), Inches(1.58) + i*GAP, Inches(5.5), Inches(0.42),
        size=16, color=DARK, bold=bold)

slide_num(s, 2, TOTAL)


# ─────────────────────────────────────────────────────────────────────────────
# SLIDE 3 — CONTEXTO Y PROBLEMA
# ─────────────────────────────────────────────────────────────────────────────
s = new_slide(prs)
bg(s, BG)
header_bar(s, '01 · Contexto y problema', 'La Guajira — vulnerabilidad hídrica', BLUE)

# Cuadro izquierdo — contexto
box(s, Inches(0.35), Inches(1.55), Inches(6.1), Inches(5.5),
    fill_color=WHITE, border_color=RGBColor(0xCC,0xCC,0xCC), border_width=Pt(1))
txt(s, 'Contexto', Inches(0.55), Inches(1.65), Inches(5), Inches(0.4),
    size=13, bold=True, color=BLUE)

bullet_list(s, [
    'Departamento más septentrional de Colombia; geografía semiárida.',
    'Comunidades indígenas Wayuu con acceso limitado a agua potable.',
    'Actividad minera de gran escala (carbón) presiona los acuíferos.',
    'Régimen pluvial bimodal: época seca (dic–abr) crítica para el agua.',
    'Sin sistema integrado de monitoreo y alerta temprana previo a este proyecto.',
], Inches(0.5), Inches(2.12), Inches(5.7), size=14, color=GRAY)

# Cuadro derecho — pregunta de negocio
box(s, Inches(6.8), Inches(1.55), Inches(6.1), Inches(2.6),
    fill_color=BLUE)
txt(s, 'Pregunta de negocio', Inches(7.0), Inches(1.7), Inches(5.7), Inches(0.4),
    size=12, bold=True, color=RGBColor(0xCC,0xDD,0xFF))
txt(s,
    '¿Cómo varía la calidad fisicoquímica del agua subterránea en los 11 municipios '
    'de La Guajira entre la época seca y la húmeda, y qué municipios representan riesgo '
    'crítico para el consumo humano?',
    Inches(7.0), Inches(2.1), Inches(5.7), Inches(1.8),
    size=15, bold=True, color=WHITE, wrap=True)

# Cuadro derecho — datos clave
box(s, Inches(6.8), Inches(4.35), Inches(6.1), Inches(2.7),
    fill_color=RGBColor(0xF7,0xF9,0xFF),
    border_color=RGBColor(0xCC,0xCC,0xEE), border_width=Pt(1))
txt(s, 'Datos del estudio', Inches(7.0), Inches(4.48), Inches(5.7), Inches(0.4),
    size=12, bold=True, color=BLUE)

stats = [
    ('732', 'mediciones registradas'),
    ('11',  'municipios de La Guajira'),
    ('366', 'puntos de monitoreo'),
    ('2',   'épocas: Seca (feb-2026) · Húmeda (oct-2025)'),
]
for i, (val, label) in enumerate(stats):
    txt(s, val,   Inches(7.0),  Inches(4.92) + i*Inches(0.44), Inches(1.0), Inches(0.42),
        size=20, bold=True, color=AMBER)
    txt(s, label, Inches(7.85), Inches(4.95) + i*Inches(0.44), Inches(4.7), Inches(0.4),
        size=13, color=GRAY)

slide_num(s, 3, TOTAL)


# ─────────────────────────────────────────────────────────────────────────────
# SLIDE 4 — METODOLOGÍA Y STACK
# ─────────────────────────────────────────────────────────────────────────────
s = new_slide(prs)
bg(s, BG)
header_bar(s, '02 · Metodología y tecnologías', 'Kimball · Python · React', BLUE)

fases = [
    ('Fase 1', 'Definición\nproblema + KPIs', BLUE),
    ('Fase 2', 'ETL\nPython pandas', BLUE),
    ('Fase 3', 'Modelo\nestrella', BLUE),
    ('Fase 4/5', 'Dashboard\nReact 18', AMBER),
    ('Fase 6', 'Análisis\nnarrativa', AMBER),
    ('Fase 7', 'Presentación\nPowerPoint', AMBER),
]
fw = Inches(1.9)
fgap = Inches(0.18)
fy   = Inches(1.6)

for i, (label, desc, color) in enumerate(fases):
    fx = Inches(0.3) + i * (fw + fgap)
    box(s, fx, fy, fw, Inches(1.55), fill_color=color)
    txt(s, label, fx + Inches(0.1), fy + Inches(0.08),
        fw - Inches(0.2), Inches(0.38),
        size=11, bold=True, color=WHITE)
    txt(s, desc, fx + Inches(0.1), fy + Inches(0.44),
        fw - Inches(0.2), Inches(0.95),
        size=13, bold=True, color=WHITE, wrap=True)
    # Flecha →
    if i < len(fases) - 1:
        txt(s, '›', fx + fw + Inches(0.02), fy + Inches(0.52),
            fgap + Inches(0.1), Inches(0.5),
            size=20, bold=True, color=GRAY, align=PP_ALIGN.CENTER)

# Stack tecnológico
box(s, Inches(0.35), Inches(3.45), Inches(12.6), Inches(3.65),
    fill_color=WHITE, border_color=RGBColor(0xCC,0xCC,0xCC), border_width=Pt(1))
txt(s, 'Stack tecnológico', Inches(0.55), Inches(3.55), Inches(5), Inches(0.38),
    size=13, bold=True, color=DARK)

techs = [
    ('Lenguaje / Runtime',    'Python 3.14 · JavaScript (React 18 UMD/CDN · Babel Standalone 7.29)'),
    ('Procesamiento de datos','pandas 2.x · openpyxl · SheetJS xlsx@0.18.5'),
    ('Visualización',         'Recharts (SVG) · Leaflet 1.9.4 (mapa choropleth) · CSS custom properties'),
    ('Modelado dimensional',  'draw.io (diagrama estrella) · Metodología Kimball'),
    ('Documentación',         'python-docx · python-pptx · Microsoft Word / PowerPoint'),
    ('Entorno',               'Sin build step — SPA en archivos .jsx servidos con Python http.server'),
]

for i, (cat, tech) in enumerate(techs):
    yy = Inches(4.0) + i * Inches(0.5)
    txt(s, cat,  Inches(0.55), yy, Inches(3.2), Inches(0.44),
        size=12, bold=True, color=BLUE)
    txt(s, tech, Inches(3.8),  yy, Inches(9.0), Inches(0.44),
        size=12, color=GRAY)

slide_num(s, 4, TOTAL)


# ─────────────────────────────────────────────────────────────────────────────
# SLIDE 5 — MODELO ESTRELLA
# ─────────────────────────────────────────────────────────────────────────────
s = new_slide(prs)
bg(s, BG)
header_bar(s, '03 · Modelo dimensional estrella',
           'DM_SOSTENIB_GUAJIRA · Metodología Kimball', BLUE)

# FACT central
fw2, fh2 = Inches(3.4), Inches(4.2)
fx2 = (W - fw2) / 2
fy2 = Inches(1.7)
box(s, fx2, fy2, fw2, fh2, fill_color=AMBER)
txt(s, 'FACT_MEDICION', fx2, fy2 + Inches(0.08), fw2, Inches(0.45),
    size=14, bold=True, color=WHITE, align=PP_ALIGN.CENTER)

fact_fields = [
    ('PK', 'id_medicion'),
    ('FK', 'id_punto'),
    ('FK', 'id_municipio'),
    ('FK', 'id_tiempo'),
    ('M',  'ph'),
    ('M',  'conductividad (µS/cm)'),
    ('M',  'salinidad (mS/cm)'),
    ('M',  'temperatura (°C)'),
    ('M',  'std_mg_l (mg/L)'),
    ('M',  'estado'),
]
for i, (badge, field) in enumerate(fact_fields):
    yy = fy2 + Inches(0.55) + i * Inches(0.35)
    clr = WHITE if badge == 'PK' else (RGBColor(0xCC,0xDD,0xFF) if badge == 'FK' else RGBColor(0xEE,0xCC,0xAA))
    txt(s, badge, fx2 + Inches(0.12), yy, Inches(0.5), Inches(0.33),
        size=9, bold=True, color=clr)
    txt(s, field, fx2 + Inches(0.55), yy, fw2 - Inches(0.65), Inches(0.33),
        size=10, color=WHITE)

# DIM boxes
dw, dh = Inches(2.8), Inches(0.0)  # height computed per dim
dims = [
    ('DIM_MUNICIPIO', ['PK id_municipio','codigo_dane','nombre_municipio','zona (Alta/Media/Baja)','activo'],
     Inches(0.2), Inches(2.7)),
    ('DIM_PUNTO',     ['PK id_punto','codigo_punto','tipo (Pozo/Manantial…)','uso (Consumo/Riego…)','latitud','longitud'],
     W - Inches(3.0), Inches(2.5)),
    ('DIM_TIEMPO',    ['PK id_tiempo','fecha','anio','mes (1–12)','trimestre (Q1–Q4)','temporada (Seca/Húm.)'],
     (W - Inches(2.8)) / 2, Inches(1.42)),
]

for name, fields, dx, dy in dims:
    dh = Inches(0.45) + len(fields) * Inches(0.34)
    box(s, dx, dy, dw, dh, fill_color=BLUE)
    txt(s, name, dx, dy + Inches(0.06), dw, Inches(0.38),
        size=12, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    for i, f in enumerate(fields):
        txt(s, f, dx + Inches(0.15), dy + Inches(0.44) + i * Inches(0.34),
            dw - Inches(0.2), Inches(0.33), size=10, color=WHITE)

# Etiquetas 1:N
txt(s, '1:N', Inches(3.0),  Inches(3.1),  Inches(0.7), Inches(0.35),
    size=12, bold=True, color=BLUE, align=PP_ALIGN.CENTER)
txt(s, '1:N', W-Inches(3.6), Inches(3.1), Inches(0.7), Inches(0.35),
    size=12, bold=True, color=BLUE, align=PP_ALIGN.CENTER)
txt(s, '1:N', Inches(5.7), Inches(1.55), Inches(0.7), Inches(0.35),
    size=12, bold=True, color=BLUE, align=PP_ALIGN.CENTER)

slide_num(s, 5, TOTAL)


# ─────────────────────────────────────────────────────────────────────────────
# SLIDE 6 — ETL
# ─────────────────────────────────────────────────────────────────────────────
s = new_slide(prs)
bg(s, BG)
header_bar(s, '04 · Pipeline ETL', 'Python pandas · 0.44 s · 732 registros', BLUE)

# Tres bloques E → T → L
etl = [
    ('EXTRACT', 'E', BLUE,
     ['Lee Excel / CSV (IDEAM)', 'Genera datos de muestra si no hay fuente', '732 filas extraídas']),
    ('TRANSFORM', 'T', AMBER,
     ['Normaliza columnas y tipos', 'Elimina duplicados y outliers físicos', 'Imputa nulos con mediana', 'Clasifica estado (Apta/Alerta/Crítico)', 'Construye 4 tablas dimensionales']),
    ('LOAD', 'L', GREEN,
     ['Escribe 5 hojas en dwh_guajira.xlsx', 'FACT (732 filas) · 3 DIM · KPIs', 'Encabezados con color por tipo de tabla']),
]

bw = Inches(3.6)
for i, (title, letter, color, steps) in enumerate(etl):
    bx = Inches(0.35) + i * (bw + Inches(0.3))
    box(s, bx, Inches(1.55), bw, Inches(0.6), fill_color=color)
    txt(s, title, bx, Inches(1.58), bw, Inches(0.55),
        size=20, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    box(s, bx, Inches(2.2), bw, Inches(4.6),
        fill_color=WHITE,
        border_color=RGBColor(0xCC,0xCC,0xCC), border_width=Pt(1))
    for j, step in enumerate(steps):
        txt(s, '✓  ' + step,
            bx + Inches(0.15), Inches(2.35) + j * Inches(0.58),
            bw - Inches(0.25), Inches(0.52),
            size=13, color=DARK)
    # Flecha
    if i < 2:
        txt(s, '→',
            bx + bw + Inches(0.02), Inches(2.6),
            Inches(0.28), Inches(0.5),
            size=22, bold=True, color=GRAY, align=PP_ALIGN.CENTER)

# KPIs del pipeline
box(s, Inches(0.35), Inches(7.0), Inches(12.6), Inches(0.38),
    fill_color=DARK)
stats_etl = [
    ('732', 'mediciones'),
    ('11',  'municipios'),
    ('366', 'puntos únicos'),
    ('82.8 %', 'estado Apta'),
    ('17.2 %', 'estado Alerta'),
    ('7.199', 'pH promedio'),
    ('2 710.9', 'µS/cm cond.'),
    ('31.52 °C', 'temp. prom.'),
]
sw = Inches(12.6) / len(stats_etl)
for i, (val, lbl) in enumerate(stats_etl):
    sx = Inches(0.35) + i * sw
    txt(s, val, sx + Inches(0.06), Inches(7.02), sw - Inches(0.1), Inches(0.18),
        size=9, bold=True, color=AMBER, align=PP_ALIGN.CENTER)
    txt(s, lbl, sx + Inches(0.06), Inches(7.2), sw - Inches(0.1), Inches(0.16),
        size=7.5, color=WHITE, align=PP_ALIGN.CENTER)

slide_num(s, 6, TOTAL)


# ─────────────────────────────────────────────────────────────────────────────
# SLIDE 7 — DASHBOARD OVERVIEW
# ─────────────────────────────────────────────────────────────────────────────
s = new_slide(prs)
bg(s, DARK)
header_bar(s, '05 · Dashboard interactivo — GUAJIRAGUA',
           'React 18 · Leaflet · 6 páginas · sin build step', AMBER)

paginas = [
    ('Mapa interactivo',   '11 municipios · choropleth · filtros seca/húmeda · drill-down'),
    ('Fisicoquímica',      'pH · Conductividad · Salinidad · Temperatura · panel de detalle por municipio'),
    ('Alertas',            '26 alertas activas · filtro por severidad · reconocimiento'),
    ('Análisis temporal',  'Dual line chart · heatmap municipal · 8 KPIs Kimball con sparklines'),
    ('Reporte',            'Exportación XLSX real con SheetJS · programador de informes'),
    ('Administración',     'ETL log · Bus Matrix · usuarios del sistema'),
]
pw = Inches(5.8)
for i, (title, desc) in enumerate(paginas):
    col = i % 2
    row = i // 2
    px  = Inches(0.35) + col * (pw + Inches(0.45))
    py  = Inches(1.58) + row * Inches(1.75)
    box(s, px, py, pw, Inches(1.6),
        fill_color=RGBColor(0x28,0x28,0x28),
        border_color=AMBER, border_width=Pt(1.5))
    box(s, px, py, Inches(0.12), Inches(1.6), fill_color=AMBER)
    txt(s, f'Pág. {i+1}  ·  {title}',
        px + Inches(0.25), py + Inches(0.12),
        pw - Inches(0.35), Inches(0.44),
        size=14, bold=True, color=WHITE)
    txt(s, desc,
        px + Inches(0.25), py + Inches(0.58),
        pw - Inches(0.35), Inches(0.88),
        size=11, color=RGBColor(0xBB,0xBB,0xBB), wrap=True)

# Nota demo
box(s, Inches(0.35), H - Inches(0.55), Inches(12.6), Inches(0.42),
    fill_color=BLUE)
txt(s, '★  DEMO EN VIVO  —  abrir navegador en  http://localhost:3001/',
    Inches(0.55), H - Inches(0.51), Inches(12.2), Inches(0.38),
    size=13, bold=True, color=WHITE, align=PP_ALIGN.CENTER)

slide_num(s, 7, TOTAL)


# ─────────────────────────────────────────────────────────────────────────────
# SLIDE 8 — HALLAZGO 1: ALTA GUAJIRA EN RIESGO
# ─────────────────────────────────────────────────────────────────────────────
s = new_slide(prs)
bg(s, BG)
header_bar(s, '06 · Hallazgo 1 — Alta Guajira concentra el riesgo',
           'IDA > 45 en época seca · 68 % de puntos críticos', RED)

# Tabla municipios críticos
box(s, Inches(0.35), Inches(1.55), Inches(7.5), Inches(5.55),
    fill_color=WHITE, border_color=RGBColor(0xCC,0xCC,0xCC), border_width=Pt(1))
txt(s, 'Índice de Deterioro del Acuífero (IDA) por municipio',
    Inches(0.55), Inches(1.65), Inches(7.0), Inches(0.38),
    size=13, bold=True, color=DARK)

tabla = [
    ('Uribia',     'Alta',  '52.3', 'ALTO',         RED),
    ('Manaure',    'Alta',  '49.8', 'ALTO',         RED),
    ('Maicao',     'Alta',  '45.2', 'MOD-ALTO',     AMBER),
    ('Riohacha',   'Media', '38.7', 'MODERADO',     AMBER),
    ('Albania',    'Media', '33.9', 'MODERADO',     AMBER),
    ('Hatonuevo',  'Baja',  '28.1', 'BAJO-MOD',     GREEN),
    ('Barrancas',  'Baja',  '26.4', 'BAJO-MOD',     GREEN),
    ('Fonseca',    'Baja',  '24.2', 'BAJO',         GREEN),
]
headers_t = ['Municipio', 'Zona', 'IDA seca', 'Nivel']
col_x = [Inches(0.55), Inches(2.55), Inches(4.0), Inches(5.2)]
col_w = [Inches(1.9), Inches(1.35), Inches(1.1), Inches(1.9)]
row_h = Inches(0.54)

# Header row
box(s, Inches(0.45), Inches(2.1), Inches(7.3), row_h, fill_color=RED)
for j, h in enumerate(headers_t):
    txt(s, h, col_x[j], Inches(2.16), col_w[j], Inches(0.42),
        size=11, bold=True, color=WHITE)

for i, (muni, zona, ida, nivel, color) in enumerate(tabla):
    ry = Inches(2.1) + (i + 1) * row_h
    bg_c = RGBColor(0xFF,0xF3,0xF3) if i % 2 == 0 else WHITE
    box(s, Inches(0.45), ry, Inches(7.3), row_h, fill_color=bg_c)
    txt(s, muni, col_x[0], ry + Inches(0.1), col_w[0], Inches(0.38),
        size=12, bold=True, color=DARK)
    txt(s, zona, col_x[1], ry + Inches(0.1), col_w[1], Inches(0.38),
        size=12, color=GRAY)
    txt(s, ida,  col_x[2], ry + Inches(0.1), col_w[2], Inches(0.38),
        size=14, bold=True, color=color, align=PP_ALIGN.CENTER)
    txt(s, nivel, col_x[3], ry + Inches(0.08), col_w[3], Inches(0.42),
        size=11, bold=True, color=color)

# Panel derecho — insight
box(s, Inches(8.1), Inches(1.55), Inches(4.85), Inches(5.55), fill_color=RED)
txt(s, 'HALLAZGO', Inches(8.3), Inches(1.68), Inches(4.5), Inches(0.38),
    size=11, bold=True, color=RGBColor(0xFF,0xCC,0xCC))
txt(s, 'Uribia y Manaure superan el umbral de riesgo (IDA = 50)',
    Inches(8.3), Inches(2.08), Inches(4.4), Inches(1.0),
    size=17, bold=True, color=WHITE, wrap=True)
txt(s, 'La Alta Guajira concentra el 68 % de los puntos en estado Alerta '
       'pese a representar solo el 27 % de los puntos totales.',
    Inches(8.3), Inches(3.15), Inches(4.4), Inches(1.4),
    size=13, color=WHITE, wrap=True)
txt(s, 'Recomendación: priorizar inversión en infraestructura de '
       'tratamiento de agua en Uribia y Manaure antes del próximo ciclo seco.',
    Inches(8.3), Inches(4.65), Inches(4.4), Inches(1.7),
    size=12, italic=True, color=RGBColor(0xFF,0xEE,0xCC), wrap=True)

slide_num(s, 8, TOTAL)


# ─────────────────────────────────────────────────────────────────────────────
# SLIDE 9 — HALLAZGO 2: VARIACIÓN ESTACIONAL
# ─────────────────────────────────────────────────────────────────────────────
s = new_slide(prs)
bg(s, BG)
header_bar(s, '07 · Hallazgo 2 — Variación estacional de salinidad',
           'VSal = 62.6 %  ·  Meta: < 25 %  ·  EXCEDE 2.5×', AMBER)

# Barras comparativas
params = [
    ('pH',             7.21, 7.14, 9.0,  7.0,  BLUE,  '{:.2f}'),
    ('Cond. (µS/cm)',  3118, 2413, 5000, 1000,  BLUE,  '{:.0f}'),
    ('Salinidad (mS/cm)', 1.74, 1.07, 3.5, 0,  RED,   '{:.2f}'),
    ('Temperatura (°C)', 31.52, 30.08, 35, 28,  AMBER, '{:.1f}'),
]

bx0 = Inches(0.5)
for i, (name, seca, hum, mx, mn, color, fmt) in enumerate(params):
    by = Inches(1.65) + i * Inches(1.35)
    txt(s, name, bx0, by, Inches(2.8), Inches(0.38), size=13, bold=True, color=DARK)
    bar_w = Inches(7.0)
    bar_x = Inches(3.5)
    # Fondo
    box(s, bar_x, by + Inches(0.08), bar_w, Inches(0.4),
        fill_color=RGBColor(0xE0,0xE0,0xE0))
    box(s, bar_x, by + Inches(0.55), bar_w, Inches(0.4),
        fill_color=RGBColor(0xE0,0xE0,0xE0))
    # Barras seca / húmeda
    rng  = mx - mn if mx != mn else 1
    ws   = bar_w * min(1, (seca - mn) / rng)
    wh   = bar_w * min(1, (hum  - mn) / rng)
    box(s, bar_x, by + Inches(0.08), ws, Inches(0.4), fill_color=color)
    box(s, bar_x, by + Inches(0.55), wh, Inches(0.4),
        fill_color=RGBColor(0x88,0xAA,0xDD))
    txt(s, '● Seca ' + fmt.format(seca),
        Inches(10.65), by + Inches(0.1), Inches(2.5), Inches(0.38),
        size=12, bold=True, color=color)
    txt(s, '● Húm. ' + fmt.format(hum),
        Inches(10.65), by + Inches(0.57), Inches(2.5), Inches(0.38),
        size=12, color=RGBColor(0x55,0x88,0xCC))

# Callout variación salinidad
box(s, Inches(0.35), Inches(7.0), Inches(12.6), Inches(0.4), fill_color=RED)
txt(s, '⚠   Salinidad época seca = 1.74 mS/cm  vs  1.07 mS/cm húmeda  →  variación +62.6 %  (meta: < 25 %)',
    Inches(0.55), Inches(7.04), Inches(12.2), Inches(0.35),
    size=12, bold=True, color=WHITE, align=PP_ALIGN.CENTER)

slide_num(s, 9, TOTAL)


# ─────────────────────────────────────────────────────────────────────────────
# SLIDE 10 — HALLAZGO 3: TIPO DE FUENTE
# ─────────────────────────────────────────────────────────────────────────────
s = new_slide(prs)
bg(s, BG)
header_bar(s, '08 · Hallazgo 3 — Pozos subterráneos: mayor riesgo',
           '22.5 % de pozos en estado Alerta · principal fuente Wayuu', BLUE)

fuentes = [
    ('Pozo\nsubterráneo', 142, 22.5, RED),
    ('Manantial',         98,  16.3, AMBER),
    ('Quebrada',          82,   9.8, GREEN),
    ('Embalse',           44,   6.1, GREEN),
]
fw3 = Inches(2.7)
for i, (name, n, pct, color) in enumerate(fuentes):
    fx3 = Inches(0.4) + i * (fw3 + Inches(0.35))
    fy3 = Inches(1.6)
    box(s, fx3, fy3, fw3, Inches(0.7), fill_color=color)
    txt(s, name, fx3, fy3 + Inches(0.05), fw3, Inches(0.62),
        size=14, bold=True, color=WHITE, align=PP_ALIGN.CENTER, wrap=True)
    box(s, fx3, fy3 + Inches(0.75), fw3, Inches(3.8),
        fill_color=WHITE,
        border_color=RGBColor(0xCC,0xCC,0xCC), border_width=Pt(1))
    txt(s, f'{pct} %', fx3, fy3 + Inches(0.95), fw3, Inches(0.8),
        size=36, bold=True, color=color, align=PP_ALIGN.CENTER)
    txt(s, 'puntos en Alerta',
        fx3, fy3 + Inches(1.72), fw3, Inches(0.38),
        size=12, color=GRAY, align=PP_ALIGN.CENTER)
    # Barra de porcentaje
    bar_total = Inches(2.4)
    box(s, fx3 + Inches(0.15), fy3 + Inches(2.2), bar_total, Inches(0.28),
        fill_color=LGRAY)
    box(s, fx3 + Inches(0.15), fy3 + Inches(2.2),
        bar_total * (pct / 30), Inches(0.28), fill_color=color)
    txt(s, f'{n} puntos monitoreados',
        fx3, fy3 + Inches(2.6), fw3, Inches(0.38),
        size=11, color=GRAY, align=PP_ALIGN.CENTER)

# Insight box
box(s, Inches(0.35), Inches(5.8), Inches(12.6), Inches(1.5),
    fill_color=BLUE)
txt(s, 'Implicación para la gestión hídrica',
    Inches(0.6), Inches(5.9), Inches(12.0), Inches(0.4),
    size=13, bold=True, color=RGBColor(0xCC,0xDD,0xFF))
txt(s,
    'Los pozos subterráneos son la principal fuente de agua para las comunidades Wayuu en la Alta Guajira y presentan '
    'la mayor tasa de alertas (22.5 %). Se recomienda instalar sistemas de desalinización/ósmosis inversa en los '
    '20 pozos con conductividad > 3 500 µS/cm identificados en el dataset.',
    Inches(0.6), Inches(6.32), Inches(12.0), Inches(0.85),
    size=13, color=WHITE, wrap=True)

slide_num(s, 10, TOTAL)


# ─────────────────────────────────────────────────────────────────────────────
# SLIDE 11 — KPIs SCORECARD
# ─────────────────────────────────────────────────────────────────────────────
s = new_slide(prs)
bg(s, BG)
header_bar(s, '09 · KPIs estratégicos — Scorecard',
           'DM_SOSTENIB_GUAJIRA · 8 KPIs Kimball', AMBER)

kpis_data = [
    ('IPH',    'Índice de Potabilidad',     '72.4',  '≥ 70',    GREEN,  '▲ CUMPLE'),
    ('IDA',    'Deterioro del Acuífero',    '38.1',  '< 40',    GREEN,  '▲ CUMPLE'),
    ('VSal',   'Variación Salinidad',       '62.0 %','< 25 %',  RED,    '▼ EXCEDE'),
    ('TCP',    'Tasa Puntos Críticos',      '9.7 %', '< 10 %',  AMBER,  '◆ LÍMITE'),
    ('CobAct', 'Cobertura Activa',          '94.3 %','≥ 85 %',  GREEN,  '▲ CUMPLE'),
    ('ΔpH',    'Variación pH',              '0.07',  '< 0.3',   GREEN,  '▲ CUMPLE'),
    ('TAS',    'Tasa Alertas Activas',      '3.8 %', '< 5 %',   GREEN,  '▲ CUMPLE'),
    ('ICond',  'Conductividad Relativa',    '181 %', '< 100 %', RED,    '▼ EXCEDE'),
]

kw = Inches(5.8)
kh = Inches(1.22)
kgap_x = Inches(0.4)
kgap_y = Inches(0.18)

for i, (code, name, val, meta, color, estado) in enumerate(kpis_data):
    col = i % 2
    row = i // 2
    kx  = Inches(0.35) + col * (kw + kgap_x)
    ky  = Inches(1.55) + row * (kh + kgap_y)
    # Fondo de la tarjeta
    box(s, kx, ky, kw, kh,
        fill_color=WHITE,
        border_color=color, border_width=Pt(2))
    # Barra izquierda de color
    box(s, kx, ky, Inches(0.12), kh, fill_color=color)
    # Código
    txt(s, code, kx + Inches(0.2), ky + Inches(0.06),
        Inches(1.0), Inches(0.42), size=14, bold=True, color=color)
    # Nombre
    txt(s, name, kx + Inches(0.2), ky + Inches(0.46),
        Inches(2.8), Inches(0.38), size=11, color=GRAY)
    # Valor grande
    txt(s, val, kx + Inches(3.0), ky + Inches(0.06),
        Inches(1.5), Inches(0.6), size=26, bold=True, color=color, align=PP_ALIGN.RIGHT)
    # Meta
    txt(s, 'Meta: ' + meta, kx + Inches(3.0), ky + Inches(0.68),
        Inches(1.5), Inches(0.3), size=10, color=GRAY, align=PP_ALIGN.RIGHT)
    # Estado badge
    bg_badge = RGBColor(0xE8,0xF8,0xEE) if color == GREEN else \
               (RGBColor(0xFD,0xF0,0xEE) if color == RED else RGBColor(0xFD,0xF5,0xE8))
    box(s, kx + Inches(4.6), ky + Inches(0.3), Inches(1.1), Inches(0.42),
        fill_color=bg_badge)
    txt(s, estado, kx + Inches(4.6), ky + Inches(0.32), Inches(1.1), Inches(0.4),
        size=9, bold=True, color=color, align=PP_ALIGN.CENTER)

slide_num(s, 11, TOTAL)


# ─────────────────────────────────────────────────────────────────────────────
# SLIDE 12 — RECOMENDACIONES
# ─────────────────────────────────────────────────────────────────────────────
s = new_slide(prs)
bg(s, BG)
header_bar(s, '10 · Recomendaciones estratégicas', '5 acciones prioritarias', GREEN)

recos = [
    (GREEN, '01', 'Ampliar red de monitoreo en Alta Guajira',
     'Meta: ≥ 40 puntos activos en Uribia y Manaure. Instalar sensores IoT de conductividad en tiempo real.'),
    (AMBER, '02', 'Sistema de alerta temprana estacional',
     'Activar protocolos de emergencia en enero cuando conductividad media > 2 800 µS/cm.'),
    (RED,   '03', 'Tratamiento prioritario de pozos subterráneos',
     'Instalar ósmosis inversa en los 20 pozos con conductividad > 3 500 µS/cm.'),
    (BLUE,  '04', 'Usar conductividad como proxy de campo',
     'r = 0.94 con salinidad. Conductímetros portátiles de bajo costo para monitoreo comunitario.'),
    (GRAY,  '05', 'Integrar precipitación al modelo ETL',
     'Datos pluviométricos IDEAM → correlacionar recarga con mejora de calidad → modelos predictivos.'),
]

rh = Inches(1.07)
for i, (color, num, title, desc) in enumerate(recos):
    ry = Inches(1.58) + i * (rh + Inches(0.1))
    box(s, Inches(0.35), ry, Inches(0.7), rh, fill_color=color)
    txt(s, num, Inches(0.35), ry + Inches(0.28), Inches(0.7), Inches(0.45),
        size=18, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    box(s, Inches(1.1), ry, Inches(11.85), rh,
        fill_color=WHITE,
        border_color=RGBColor(0xCC,0xCC,0xCC), border_width=Pt(1))
    txt(s, title, Inches(1.3), ry + Inches(0.07),
        Inches(11.4), Inches(0.42), size=14, bold=True, color=DARK)
    txt(s, desc,  Inches(1.3), ry + Inches(0.52),
        Inches(11.4), Inches(0.45), size=12, color=GRAY)

slide_num(s, 12, TOTAL)


# ─────────────────────────────────────────────────────────────────────────────
# SLIDE 13 — CONCLUSIONES
# ─────────────────────────────────────────────────────────────────────────────
s = new_slide(prs)
bg(s, BG)
header_bar(s, '11 · Conclusiones', 'GUAJIRAGUA · Proyecto Final · UMB', BLUE)

conclusiones = [
    (AMBER, 'Viabilidad demostrada',
     'El enfoque BI aplicado al monitoreo hidrogeológico es viable y escalable para datos de calidad hídrica en contextos de alta variabilidad estacional.'),
    (RED,   'Estacionalidad = principal factor de riesgo',
     'La época seca eleva la salinidad en un 62.6 % y duplica los puntos en alerta. El calendario de gestión hídrica debe orientarse a este ciclo.'),
    (BLUE,  'Alta Guajira requiere atención urgente',
     'Uribia y Manaure superan el IDA crítico de 50 en época seca. Son además la zona con mayor población indígena sin acceso a acueducto.'),
    (GREEN, 'KPIs: 6 de 8 cumplen o están en límite',
     'IPH, IDA, CobAct, ΔpH y TAS cumplen sus metas. VSal e ICond requieren intervención inmediata.'),
    (GRAY,  'Modelo dimensional como base analítica sólida',
     'El star schema Kimball integra 732 registros en una estructura que soporta consultas por época, zona, municipio y tipo de fuente simultáneamente.'),
]

ch = Inches(0.98)
for i, (color, title, desc) in enumerate(conclusiones):
    cy = Inches(1.58) + i * (ch + Inches(0.14))
    box(s, Inches(0.35), cy, Inches(0.08), ch, fill_color=color)
    txt(s, title, Inches(0.6), cy + Inches(0.05),
        Inches(4.5), Inches(0.4), size=13, bold=True, color=color)
    txt(s, desc,  Inches(0.6), cy + Inches(0.46),
        Inches(12.3), Inches(0.45), size=12, color=GRAY, wrap=True)

slide_num(s, 13, TOTAL)


# ─────────────────────────────────────────────────────────────────────────────
# SLIDE 14 — CIERRE
# ─────────────────────────────────────────────────────────────────────────────
s = new_slide(prs)
bg(s, DARK)
box(s, 0, 0, Inches(0.55), H, fill_color=AMBER)
box(s, 0, H - Inches(1.1), W, Inches(1.1), fill_color=BLUE)

txt(s, 'GUAJIRAGUA', Inches(0.9), Inches(1.4), Inches(10), Inches(1.6),
    size=64, bold=True, color=AMBER)
txt(s, '¡Gracias!', Inches(0.9), Inches(2.95), Inches(8), Inches(0.85),
    size=38, bold=True, color=WHITE)
box(s, Inches(0.9), Inches(3.85), Inches(5.5), Inches(0.06), fill_color=AMBER)

txt(s, 'Demo en vivo', Inches(0.9), Inches(4.05), Inches(5), Inches(0.45),
    size=18, bold=True, color=AMBER)
txt(s, 'http://localhost:3001/',
    Inches(0.9), Inches(4.5), Inches(5), Inches(0.4),
    size=16, color=RGBColor(0x99,0xBB,0xFF), italic=True)

# Resumen final
resumen = [
    '732 mediciones · 11 municipios · 2 épocas',
    '6 páginas de dashboard · 8 KPIs · 10+ visualizaciones',
    'Pipeline ETL Python · Modelo estrella Kimball',
    '3 documentos Word + 1 PowerPoint generados automáticamente',
]
for i, line in enumerate(resumen):
    txt(s, '✓  ' + line,
        Inches(0.9), Inches(5.2) + i * Inches(0.42),
        Inches(8.0), Inches(0.4),
        size=13, color=RGBColor(0xBB,0xBB,0xBB))

txt(s, f'Bryan Failach  ·  UMB Ingeniería de Negocios  ·  {datetime.date.today().strftime("%Y")}',
    Inches(0.55), H - Inches(0.8), W - Inches(1.0), Inches(0.5),
    size=12, color=RGBColor(0xCC,0xCC,0xFF), align=PP_ALIGN.LEFT)

slide_num(s, 14, TOTAL)


# ── Guardar ───────────────────────────────────────────────────────────────────
OUTPUT = 'GUAJIRAGUA_Presentacion_Final.pptx'
prs.save(OUTPUT)
print(f'\n  Presentacion generada: {OUTPUT}')
print(f'  Slides: {TOTAL}  |  Widescreen 16:9  |  Paleta GUAJIRAGUA')
print(f'  Secciones: Portada · Agenda · Contexto · Stack · Modelo · ETL · '
      f'Dashboard · 3 Hallazgos · KPIs · Recomendaciones · Conclusiones · Cierre')
