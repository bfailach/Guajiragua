"""
generar_doc_fase1.py
====================
Genera el documento Word de la Fase 1 del Proyecto Final (UMB · Ing. de Negocios)
Fase 1: Definición del problema + KPIs estratégicos

Ejecución:
  python generar_doc_fase1.py
"""

import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

from docx import Document
from docx.shared import Pt, Cm, RGBColor, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
import datetime

# ── Colores corporativos ──────────────────────────────────────────────────────
C_AMBER  = RGBColor(0xC9, 0x7A, 0x2B)   # ámbar  — hechos
C_BLUE   = RGBColor(0x2C, 0x5F, 0xA6)   # azul   — dimensiones
C_GREEN  = RGBColor(0x2E, 0x8B, 0x57)   # verde  — estado óptimo
C_RED    = RGBColor(0xB5, 0x40, 0x3D)   # rojo   — estado crítico
C_DARK   = RGBColor(0x1A, 0x1A, 0x1A)   # casi negro
C_GRAY   = RGBColor(0x55, 0x55, 0x55)   # gris texto
C_LGRAY  = RGBColor(0xF0, 0xF2, 0xF5)   # gris claro fondo

# ── Helpers ───────────────────────────────────────────────────────────────────
def set_cell_bg(cell, hex_color: str):
    """Aplica color de fondo a una celda de tabla."""
    tc   = cell._tc
    tcPr = tc.get_or_add_tcPr()
    shd  = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), hex_color)
    tcPr.append(shd)

def set_cell_border(cell, **kwargs):
    """Agrega bordes a una celda."""
    tc   = cell._tc
    tcPr = tc.get_or_add_tcPr()
    tcBorders = OxmlElement('w:tcBorders')
    for side in ('top', 'left', 'bottom', 'right', 'insideH', 'insideV'):
        val = kwargs.get(side, {})
        if val:
            tag = OxmlElement(f'w:{side}')
            for k, v in val.items():
                tag.set(qn(f'w:{k}'), v)
            tcBorders.append(tag)
    tcPr.append(tcBorders)

def add_run(para, text, bold=False, italic=False,
            size=11, color=None, font='Calibri'):
    run = para.add_run(text)
    run.bold   = bold
    run.italic = italic
    run.font.name = font
    run.font.size = Pt(size)
    if color:
        run.font.color.rgb = color
    return run

def heading(doc, text, level=1, color=C_DARK, size=None):
    sizes = {1: 15, 2: 13, 3: 11}
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(14)
    p.paragraph_format.space_after  = Pt(4)
    run = p.add_run(text)
    run.bold = True
    run.font.name  = 'Calibri'
    run.font.size  = Pt(size or sizes.get(level, 11))
    run.font.color.rgb = color
    if level == 1:
        # línea divisoria debajo
        pPr  = p._p.get_or_add_pPr()
        pBdr = OxmlElement('w:pBdr')
        bot  = OxmlElement('w:bottom')
        bot.set(qn('w:val'),   'single')
        bot.set(qn('w:sz'),    '6')
        bot.set(qn('w:space'), '4')
        bot.set(qn('w:color'), f'{color[0]:02X}{color[1]:02X}{color[2]:02X}')
        pBdr.append(bot)
        pPr.append(pBdr)
    return p

def body(doc, text, size=11, color=C_GRAY, space_after=6, indent=False):
    p = doc.add_paragraph()
    p.paragraph_format.space_after  = Pt(space_after)
    p.paragraph_format.space_before = Pt(0)
    if indent:
        p.paragraph_format.left_indent = Cm(0.8)
    add_run(p, text, size=size, color=color)
    return p

def bullet(doc, text, size=11):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_after  = Pt(3)
    p.paragraph_format.left_indent  = Cm(1.0)
    add_run(p, text, size=size, color=C_GRAY)
    return p


# ── Documento ─────────────────────────────────────────────────────────────────
doc = Document()

# Márgenes
for section in doc.sections:
    section.top_margin    = Cm(2.5)
    section.bottom_margin = Cm(2.5)
    section.left_margin   = Cm(3.0)
    section.right_margin  = Cm(2.5)

# ─────────────────────────────────────────────────────────────────────────────
# PORTADA
# ─────────────────────────────────────────────────────────────────────────────
doc.add_paragraph()   # espacio superior

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
add_run(p, 'UNIVERSIDAD MANUELA BELTRÁN', bold=True, size=13, color=C_BLUE)

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
add_run(p, 'Facultad de Ingeniería de Negocios', size=11, color=C_GRAY)

doc.add_paragraph()

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
add_run(p, 'GUAJIRAGUA', bold=True, size=26, color=C_AMBER)

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
add_run(p, 'Sistema de Inteligencia de Negocios Hidrogeológico\npara el Departamento de La Guajira, Colombia',
        size=14, color=C_DARK, italic=True)

doc.add_paragraph()
doc.add_paragraph()

# Cuadro de datos del proyecto
tbl = doc.add_table(rows=5, cols=2)
tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
tbl.style = 'Table Grid'
widths = [Cm(4.5), Cm(10.5)]
labels = ['Asignatura', 'Inteligencia de Negocios (090808-151)']
data   = [
    ('Asignatura',   'Inteligencia de Negocios (090808-151)'),
    ('Entrega',      'Fase 1 — Definición del problema y KPIs'),
    ('Fecha',        datetime.date.today().strftime('%d de %B de %Y')),
    ('Equipo',       'Bryan Failach'),
    ('Periodo',      '2025-II / 2026-I'),
]
for i, (lbl, val) in enumerate(data):
    row = tbl.rows[i]
    row.cells[0].width = widths[0]
    row.cells[1].width = widths[1]
    set_cell_bg(row.cells[0], '2C5FA6')
    set_cell_bg(row.cells[1], 'F7F9FF')
    p0 = row.cells[0].paragraphs[0]
    p1 = row.cells[1].paragraphs[0]
    add_run(p0, lbl, bold=True, size=10, color=RGBColor(0xFF,0xFF,0xFF))
    add_run(p1, val, size=10, color=C_DARK)

doc.add_page_break()


# ─────────────────────────────────────────────────────────────────────────────
# 1. CONTEXTO Y JUSTIFICACIÓN
# ─────────────────────────────────────────────────────────────────────────────
heading(doc, '1. Contexto y justificación', level=1, color=C_BLUE)

body(doc,
     'La Guajira es el departamento más septentrional de Colombia y uno de los territorios '
     'con mayor vulnerabilidad hídrica del país. Su geografía semiárida, la presencia de '
     'comunidades indígenas Wayuu y la actividad minera a gran escala generan una presión '
     'sostenida sobre los acuíferos, ríos y fuentes de agua subterránea de la región.',
     size=11)

body(doc,
     'Estudios del IDEAM y el INGEOMINAS reportan aumentos sostenidos en la salinidad y '
     'conductividad del agua subterránea, especialmente durante la época seca (diciembre–abril), '
     'cuando la ausencia de recarga pluvial expone a comunidades enteras a agua no apta para '
     'consumo humano. Esta problemática carece de un sistema integrado de seguimiento que '
     'permita tomar decisiones basadas en datos de forma oportuna.',
     size=11)

heading(doc, '1.1 Pregunta de negocio principal', level=2, color=C_BLUE)
p = doc.add_paragraph()
p.paragraph_format.left_indent = Cm(0.8)
p.paragraph_format.space_after = Pt(8)
add_run(p, '¿Cómo varía la calidad fisicoquímica del agua subterránea en los 11 municipios '
           'de La Guajira entre la época seca y la época húmeda, y qué municipios representan '
           'riesgo crítico para el consumo humano?', bold=True, size=11, color=C_DARK)

heading(doc, '1.2 Preguntas secundarias', level=2, color=C_BLUE)
preguntas = [
    '¿Cuál es la tendencia anual de pH, conductividad y salinidad por zona geográfica (Alta, Media, Baja Guajira)?',
    '¿Qué tipo de fuente hídrica (pozo, manantial, quebrada, embalse) presenta mayor incidencia de puntos críticos?',
    '¿Existe correlación entre la salinidad y la conductividad eléctrica a nivel municipal?',
    '¿Qué municipios superan con mayor frecuencia los umbrales IDEAM de agua apta para consumo?',
]
for q in preguntas:
    bullet(doc, q)


# ─────────────────────────────────────────────────────────────────────────────
# 2. OBJETIVOS
# ─────────────────────────────────────────────────────────────────────────────
heading(doc, '2. Objetivos', level=1, color=C_BLUE)

heading(doc, '2.1 Objetivo general', level=2, color=C_BLUE)
body(doc,
     'Diseñar e implementar un sistema de inteligencia de negocios que permita monitorear, '
     'analizar y visualizar la calidad fisicoquímica del agua subterránea en el departamento '
     'de La Guajira, facilitando la toma de decisiones en materia de gestión hídrica sostenible.',
     indent=True)

heading(doc, '2.2 Objetivos específicos', level=2, color=C_BLUE)
especificos = [
    'Construir un modelo dimensional estrella (Kimball) con los datos de monitoreo hídrico.',
    'Desarrollar un proceso ETL que integre, limpie y transforme los datos de múltiples fuentes.',
    'Implementar un dashboard interactivo con al menos 3 páginas, 8 KPIs y 8 visualizaciones distintas.',
    'Identificar municipios y tipos de fuente hídrica con mayor riesgo para la salud pública.',
    'Comparar el comportamiento estacional (seco vs húmedo) de los parámetros fisicoquímicos.',
    'Generar alertas automáticas cuando los parámetros superen los umbrales establecidos por el IDEAM.',
]
for e in especificos:
    bullet(doc, e)


# ─────────────────────────────────────────────────────────────────────────────
# 3. ACTORES / STAKEHOLDERS
# ─────────────────────────────────────────────────────────────────────────────
heading(doc, '3. Actores y partes interesadas', level=1, color=C_BLUE)

actores = [
    ('IDEAM',               'Fuente primaria de datos de monitoreo hídrico y umbrales de calidad.'),
    ('INGEOMINAS',          'Estudios hidrogeológicos y caracterización de acuíferos.'),
    ('Gobernación de La Guajira', 'Tomador de decisiones en política hídrica departamental.'),
    ('Comunidades Wayuu',   'Población más afectada por la escasez y contaminación del agua.'),
    ('Ministerio de Ambiente', 'Regulador nacional; define estándares de calidad del recurso hídrico.'),
    ('ONG ambientales',     'Organizaciones de monitoreo y defensa del territorio.'),
    ('Equipo BI (UMB)',     'Desarrollador del sistema de inteligencia de negocios — este proyecto.'),
]

tbl2 = doc.add_table(rows=len(actores)+1, cols=2)
tbl2.style = 'Table Grid'
tbl2.alignment = WD_TABLE_ALIGNMENT.CENTER

# Encabezado
for j, txt in enumerate(['Actor / Entidad', 'Rol en el proyecto']):
    c = tbl2.rows[0].cells[j]
    set_cell_bg(c, '2C5FA6')
    p2 = c.paragraphs[0]
    add_run(p2, txt, bold=True, size=10, color=RGBColor(0xFF,0xFF,0xFF))

for i, (actor, rol) in enumerate(actores):
    row = tbl2.rows[i+1]
    bg = 'EEF4FF' if i % 2 == 0 else 'FFFFFF'
    set_cell_bg(row.cells[0], bg)
    set_cell_bg(row.cells[1], bg)
    add_run(row.cells[0].paragraphs[0], actor, bold=True,  size=10, color=C_DARK)
    add_run(row.cells[1].paragraphs[0], rol,   bold=False, size=10, color=C_GRAY)

doc.add_paragraph()


# ─────────────────────────────────────────────────────────────────────────────
# 4. KPIs ESTRATÉGICOS
# ─────────────────────────────────────────────────────────────────────────────
doc.add_page_break()
heading(doc, '4. KPIs estratégicos (Metodología Kimball)', level=1, color=C_AMBER)

body(doc,
     'Los KPIs fueron definidos siguiendo la metodología Kimball para el Data Mart '
     'DM_SOSTENIB_GUAJIRA. Cada indicador tiene una fórmula explícita, un umbral de '
     'referencia y un nivel de granularidad asociado a las dimensiones del modelo estrella.',
     size=11)

kpis = [
    ('1', 'IPH',
     'Índice de Potabilidad Hídrica',
     'IPH = 100 × (P_apta / P_total) × K_pH\nK_pH = (pH_prom - 5.8) / (8.5 - 5.8)',
     '≥ 70',
     'Alto IPH = agua apta mayoritariamente para consumo.',
     'Mensual · municipio · época'),
    ('2', 'IDA',
     'Índice de Deterioro del Acuífero',
     'IDA = (Sal / 3.5) × 50 + (Cond / 5000) × 50',
     '< 40',
     'Mide presión combinada de salinidad y conductividad.',
     'Mensual · municipio'),
    ('3', 'VSal',
     'Variación estacional de salinidad',
     'VSal = (Sal_seca - Sal_húm) / Sal_húm × 100',
     '< 25 %',
     'Amplitud anual entre época seca y húmeda.',
     'Anual · municipio'),
    ('4', 'TCP',
     'Tasa de puntos críticos',
     'TCP = (Puntos_críticos / Puntos_total) × 100',
     '< 10 %',
     'Proporción de fuentes con al menos un parámetro fuera de norma.',
     'Mensual · municipio · tipo'),
    ('5', 'CobAct',
     'Cobertura de monitoreo activo',
     'CobAct = (Puntos_activos / Puntos_total) × 100',
     '≥ 85 %',
     'Porcentaje de puntos de monitoreo operativos.',
     'Mensual · municipio'),
    ('6', 'ΔpH',
     'Variación estacional de pH',
     'ΔpH = |pH_seca - pH_húm|',
     '< 0.3 unid.',
     'Diferencia de pH entre temporadas; valores altos indican inestabilidad.',
     'Mensual · municipio'),
    ('7', 'TAS',
     'Tasa de alertas activas',
     'TAS = Alertas_activas / Total_puntos × 100',
     '< 5 %',
     'Proporción de puntos con alerta sin reconocer en el período.',
     'Semanal · municipio'),
    ('8', 'ICond',
     'Índice de conductividad relativa',
     'ICond = Cond_muni / Cond_ref_IDEAM × 100\nCond_ref_IDEAM = 1500 µS/cm',
     '< 100 %',
     'Posición de cada municipio respecto al umbral nacional IDEAM.',
     'Mensual · municipio'),
]

cols_w = [Cm(0.7), Cm(1.3), Cm(2.8), Cm(4.5), Cm(1.5), Cm(3.5), Cm(2.8)]
headers = ['#', 'Código', 'Nombre', 'Fórmula', 'Meta', 'Interpretación', 'Granularidad']

tbl3 = doc.add_table(rows=len(kpis)+1, cols=7)
tbl3.style     = 'Table Grid'
tbl3.alignment = WD_TABLE_ALIGNMENT.CENTER

# Encabezado de KPIs
for j, (h, w) in enumerate(zip(headers, cols_w)):
    c = tbl3.rows[0].cells[j]
    c.width = w
    set_cell_bg(c, 'C97A2B')
    p3 = c.paragraphs[0]
    p3.alignment = WD_ALIGN_PARAGRAPH.CENTER
    add_run(p3, h, bold=True, size=9, color=RGBColor(0xFF,0xFF,0xFF))

for i, kpi in enumerate(kpis):
    row = tbl3.rows[i+1]
    bg  = 'FFF8F2' if i % 2 == 0 else 'FFFFFF'
    for j in range(7):
        row.cells[j].width = cols_w[j]
        set_cell_bg(row.cells[j], bg)
        p4 = row.cells[j].paragraphs[0]
        p4.alignment = WD_ALIGN_PARAGRAPH.LEFT
        is_bold  = j in (0, 1)
        is_code  = j == 3
        font_sz  = 8.5 if j in (3, 5, 6) else 9
        col_clr  = C_AMBER if j == 1 else (C_DARK if j in (0,1,2) else C_GRAY)
        add_run(p4, kpi[j], bold=is_bold, italic=is_code,
                size=font_sz, color=col_clr, font='Consolas' if is_code else 'Calibri')

doc.add_paragraph()


# ─────────────────────────────────────────────────────────────────────────────
# 5. ALCANCE Y FUENTES DE DATOS
# ─────────────────────────────────────────────────────────────────────────────
heading(doc, '5. Alcance del proyecto', level=1, color=C_BLUE)

alcance = [
    'Cobertura geográfica: 11 municipios del departamento de La Guajira (código DANE 44xxx).',
    'Variables fisicoquímicas: pH, conductividad eléctrica (µS/cm), salinidad (mS/cm), temperatura (°C) y sólidos totales disueltos (mg/L).',
    'Período de análisis: ventana de 12 meses rodantes (mayo 2025 – abril 2026); dos campañas de medición: época seca (febrero 2026) y época húmeda (octubre 2025).',
    'Tipos de fuente hídrica: pozos, manantiales, quebradas y embalses.',
    'Umbrales de referencia: Resolución 2115 de 2007 (MAVDT) y valores guía de la OMS para agua potable.',
]
for a in alcance:
    bullet(doc, a)

heading(doc, '5.1 Fuentes de datos', level=2, color=C_BLUE)

fuentes = [
    ('IDEAM', 'Instituto de Hidrología, Meteorología y Estudios Ambientales',
     'Registros históricos de calidad fisicoquímica del agua — CSV / API REST'),
    ('INGEOMINAS', 'Servicio Geológico Colombiano',
     'Cartografía de acuíferos y puntos de monitoreo georreferenciados — Shapefile / GeoJSON'),
    ('DANE', 'Departamento Administrativo Nacional de Estadística',
     'Códigos y límites municipales — GeoJSON de municipios de Colombia'),
    ('OMS / OPS', 'Organización Mundial / Panamericana de la Salud',
     'Guías de calidad del agua de bebida — PDF / tablas de referencia'),
]

tbl4 = doc.add_table(rows=len(fuentes)+1, cols=3)
tbl4.style     = 'Table Grid'
tbl4.alignment = WD_TABLE_ALIGNMENT.CENTER

for j, h in enumerate(['Fuente', 'Entidad', 'Uso en el proyecto']):
    c = tbl4.rows[0].cells[j]
    set_cell_bg(c, '2C5FA6')
    p5 = c.paragraphs[0]
    add_run(p5, h, bold=True, size=10, color=RGBColor(0xFF,0xFF,0xFF))

for i, (codigo, entidad, uso) in enumerate(fuentes):
    row = tbl4.rows[i+1]
    bg = 'EEF4FF' if i % 2 == 0 else 'FFFFFF'
    for j in range(3):
        set_cell_bg(row.cells[j], bg)
    add_run(row.cells[0].paragraphs[0], codigo,  bold=True,  size=10, color=C_BLUE)
    add_run(row.cells[1].paragraphs[0], entidad, bold=False, size=10, color=C_DARK)
    add_run(row.cells[2].paragraphs[0], uso,     bold=False, size=10, color=C_GRAY)

doc.add_paragraph()


# ─────────────────────────────────────────────────────────────────────────────
# 6. TECNOLOGÍAS UTILIZADAS
# ─────────────────────────────────────────────────────────────────────────────
heading(doc, '6. Tecnologías del proyecto', level=1, color=C_BLUE)

techs = [
    ('Fase 1 — Definición', 'Microsoft Word, draw.io'),
    ('Fase 2 — ETL',        'Python 3.14 · pandas · openpyxl'),
    ('Fase 3 — Modelo dimensional', 'draw.io (diagrama estrella) · Excel (tablas de referencia)'),
    ('Fase 4/5 — Dashboard BI', 'React 18 (UMD/CDN) · Babel Standalone · Leaflet 1.9.4 · SheetJS · CSS custom properties'),
    ('Fase 6 — Análisis narrativo', 'Microsoft Word · capturas del dashboard'),
    ('Fase 7 — Presentación', 'Microsoft PowerPoint'),
]

for fase, tech in techs:
    p = doc.add_paragraph()
    p.paragraph_format.left_indent = Cm(0.6)
    p.paragraph_format.space_after = Pt(4)
    add_run(p, f'{fase}: ', bold=True, size=11, color=C_DARK)
    add_run(p, tech, bold=False, size=11, color=C_GRAY)


# ─────────────────────────────────────────────────────────────────────────────
# PIE DE PÁGINA
# ─────────────────────────────────────────────────────────────────────────────
doc.add_paragraph()
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
add_run(p, f'Documento generado automáticamente el {datetime.date.today().strftime("%d/%m/%Y")} · '
           f'GUAJIRAGUA v1.0 · UMB Ingeniería de Negocios',
        size=9, color=RGBColor(0xAA, 0xAA, 0xAA), italic=True)


# ─────────────────────────────────────────────────────────────────────────────
# GUARDAR
# ─────────────────────────────────────────────────────────────────────────────
OUTPUT = 'GUAJIRAGUA_Fase1_Problema_KPIs.docx'
doc.save(OUTPUT)
print(f'\n  Documento generado: {OUTPUT}')
print(f'  Secciones: Portada · Contexto · Objetivos · Actores · 8 KPIs · Alcance · Tecnologias')
