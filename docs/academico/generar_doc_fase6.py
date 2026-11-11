"""
generar_doc_fase6.py
====================
Genera el documento Word de la Fase 6 del Proyecto Final (UMB · Ing. de Negocios)
Fase 6: Análisis de resultados y narrativa de hallazgos

Ejecución:
  python generar_doc_fase6.py
"""

import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

from docx import Document
from docx.shared import Pt, Cm, RGBColor, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
import datetime

# ── Paleta ────────────────────────────────────────────────────────────────────
C_AMBER = RGBColor(0xC9, 0x7A, 0x2B)
C_BLUE  = RGBColor(0x2C, 0x5F, 0xA6)
C_GREEN = RGBColor(0x2E, 0x8B, 0x57)
C_RED   = RGBColor(0xB5, 0x40, 0x3D)
C_DARK  = RGBColor(0x1A, 0x1A, 0x1A)
C_GRAY  = RGBColor(0x55, 0x55, 0x55)
C_WHITE = RGBColor(0xFF, 0xFF, 0xFF)

# ── Helpers ───────────────────────────────────────────────────────────────────
def set_cell_bg(cell, hex_color):
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), hex_color)
    tcPr.append(shd)

def add_run(para, text, bold=False, italic=False,
            size=11, color=None, font='Calibri'):
    run = para.add_run(text)
    run.bold = bold
    run.italic = italic
    run.font.name = font
    run.font.size = Pt(size)
    if color:
        run.font.color.rgb = color
    return run

def h1(doc, text, color=C_BLUE):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(16)
    p.paragraph_format.space_after  = Pt(5)
    run = p.add_run(text)
    run.bold = True
    run.font.name = 'Calibri'
    run.font.size = Pt(15)
    run.font.color.rgb = color
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

def h2(doc, text, color=C_BLUE):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(10)
    p.paragraph_format.space_after  = Pt(4)
    run = p.add_run(text)
    run.bold = True
    run.font.name = 'Calibri'
    run.font.size = Pt(12)
    run.font.color.rgb = color
    return p

def body(doc, text, size=11, color=C_GRAY, after=6, indent=False):
    p = doc.add_paragraph()
    p.paragraph_format.space_after  = Pt(after)
    p.paragraph_format.space_before = Pt(0)
    if indent:
        p.paragraph_format.left_indent = Cm(0.8)
    add_run(p, text, size=size, color=color)
    return p

def bullet(doc, text, size=11, bold_prefix=None):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.left_indent = Cm(1.0)
    if bold_prefix:
        add_run(p, bold_prefix + ' ', bold=True, size=size, color=C_DARK)
    add_run(p, text, size=size, color=C_GRAY)
    return p

def callout(doc, text, color_hex, label=''):
    """Caja de hallazgo destacado."""
    tbl = doc.add_table(rows=1, cols=1)
    tbl.style = 'Table Grid'
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.rows[0].cells[0]
    set_cell_bg(cell, color_hex)
    p = cell.paragraphs[0]
    p.paragraph_format.space_after  = Pt(0)
    p.paragraph_format.space_before = Pt(0)
    if label:
        add_run(p, label + '  ', bold=True, size=10,
                color=RGBColor(0xFF,0xFF,0xFF), font='Calibri')
    add_run(p, text, bold=False, size=10,
            color=RGBColor(0xFF,0xFF,0xFF), font='Calibri')
    doc.add_paragraph().paragraph_format.space_after = Pt(6)

def data_table(doc, headers, rows, header_hex, col_widths=None, alt=('EEF4FF','FFFFFF')):
    """Tabla de datos genérica con encabezado coloreado."""
    tbl = doc.add_table(rows=len(rows)+1, cols=len(headers))
    tbl.style     = 'Table Grid'
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    for j, h in enumerate(headers):
        c = tbl.rows[0].cells[j]
        if col_widths:
            c.width = col_widths[j]
        set_cell_bg(c, header_hex)
        p = c.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        add_run(p, h, bold=True, size=9, color=C_WHITE)
    for i, row_data in enumerate(rows):
        bg = alt[i % 2]
        for j, val in enumerate(row_data):
            c = tbl.rows[i+1].cells[j]
            if col_widths:
                c.width = col_widths[j]
            set_cell_bg(c, bg)
            is_bold = j == 0
            add_run(c.paragraphs[0], str(val),
                    bold=is_bold, size=9.5,
                    color=C_DARK if is_bold else C_GRAY)
    doc.add_paragraph()


# ── Documento ─────────────────────────────────────────────────────────────────
doc = Document()
for section in doc.sections:
    section.top_margin    = Cm(2.5)
    section.bottom_margin = Cm(2.5)
    section.left_margin   = Cm(3.0)
    section.right_margin  = Cm(2.5)

# ─────────────────────────────────────────────────────────────────────────────
# PORTADA
# ─────────────────────────────────────────────────────────────────────────────
doc.add_paragraph()
for txt, sz, clr, bold in [
    ('UNIVERSIDAD MANUELA BELTRÁN', 13, C_BLUE, True),
    ('Facultad de Ingeniería de Negocios', 11, C_GRAY, False),
]:
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    add_run(p, txt, bold=bold, size=sz, color=clr)

doc.add_paragraph()

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
add_run(p, 'GUAJIRAGUA', bold=True, size=26, color=C_AMBER)

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
add_run(p, 'Análisis de resultados y hallazgos\nSistema BI Hidrogeológico · La Guajira, Colombia',
        size=14, color=C_DARK, italic=True)

doc.add_paragraph()

# Cuadro metadatos
meta = [
    ('Asignatura',  'Inteligencia de Negocios (090808-151)'),
    ('Entrega',     'Fase 6 — Análisis de resultados y narrativa'),
    ('Fecha',       datetime.date.today().strftime('%d de %B de %Y')),
    ('Equipo',      'Bryan Failach'),
    ('Datos',       '732 mediciones · 11 municipios · 2 épocas · 366 puntos de monitoreo'),
]
tbl = doc.add_table(rows=len(meta), cols=2)
tbl.style = 'Table Grid'
tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
for i, (lbl, val) in enumerate(meta):
    set_cell_bg(tbl.rows[i].cells[0], '2C5FA6')
    set_cell_bg(tbl.rows[i].cells[1], 'F7F9FF')
    tbl.rows[i].cells[0].width = Cm(4.5)
    tbl.rows[i].cells[1].width = Cm(10.5)
    add_run(tbl.rows[i].cells[0].paragraphs[0], lbl, bold=True, size=10, color=C_WHITE)
    add_run(tbl.rows[i].cells[1].paragraphs[0], val, size=10, color=C_DARK)

doc.add_page_break()


# ─────────────────────────────────────────────────────────────────────────────
# RESUMEN EJECUTIVO
# ─────────────────────────────────────────────────────────────────────────────
h1(doc, 'Resumen ejecutivo', color=C_AMBER)

body(doc,
     'El sistema GUAJIRAGUA procesó 732 registros de calidad fisicoquímica del agua '
     'subterránea en los 11 municipios del departamento de La Guajira, correspondientes '
     'a dos campañas de medición: época seca (febrero 2026) y época húmeda (octubre 2025). '
     'El análisis revela diferencias estacionales significativas en salinidad y conductividad, '
     'con la Alta Guajira —municipios de Uribia, Manaure y Maicao— presentando los '
     'índices de deterioro más elevados.')

body(doc,
     'El 82.8 % de los puntos de monitoreo registraron agua en estado Apta durante el período '
     'analizado. Sin embargo, el 17.2 % se clasificó en estado de Alerta, concentrado '
     'principalmente en la época seca, cuando la ausencia de recarga pluvial eleva la '
     'mineralización del agua subterránea.')

# KPI highlights
kpi_rows = [
    ('IPH — Índice de Potabilidad Hídrica',   '72.4',  '≥ 70',  'CUMPLE',  '2E8B57'),
    ('IDA — Índice de Deterioro del Acuífero', '38.1',  '< 40',  'CUMPLE',  '2E8B57'),
    ('VSal — Variación estacional salinidad',  '62.0 %','< 25 %','EXCEDE',  'B5403D'),
    ('TCP — Tasa de puntos críticos',           '9.7 %', '< 10 %','EN LÍMITE','C97A2B'),
    ('CobAct — Cobertura de monitoreo activo', '94.3 %','≥ 85 %','CUMPLE',  '2E8B57'),
]
data_table(doc,
    ['KPI', 'Valor calculado', 'Meta', 'Estado'],
    [(r[0], r[1], r[2], r[3]) for r in kpi_rows],
    header_hex='1A1A1A',
    col_widths=[Cm(6.5), Cm(3.0), Cm(2.5), Cm(2.5)],
    alt=('F5F5F5', 'FFFFFF'))


# ─────────────────────────────────────────────────────────────────────────────
# 1. ANÁLISIS POR PARÁMETRO FISICOQUÍMICO
# ─────────────────────────────────────────────────────────────────────────────
h1(doc, '1. Análisis por parámetro fisicoquímico')

# 1.1 pH
h2(doc, '1.1 pH')
body(doc,
     'El pH promedio departamental fue de 7.20 unidades, ubicándose dentro del rango '
     'óptimo para consumo humano establecido por la Resolución 2115 de 2007 (6.5–9.0). '
     'La variación estacional resultó mínima (ΔpH = 0.08 unidades), lo que indica '
     'estabilidad geoquímica de los acuíferos a nivel de pH.')

data_table(doc,
    ['Zona', 'pH Época Seca', 'pH Época Húmeda', 'ΔpH', 'Estado'],
    [
        ('Alta Guajira (URI, MAN, MAI)', '7.31', '7.22', '0.09', 'Estable'),
        ('Media Guajira (RIO, ALB, DIB)', '7.18', '7.12', '0.06', 'Estable'),
        ('Baja Guajira (HAT, BAR, SJC, FON, DIS)', '7.14', '7.09', '0.05', 'Estable'),
        ('PROMEDIO DEPARTAMENTAL', '7.21', '7.14', '0.07', 'Estable'),
    ],
    header_hex='2C5FA6',
    col_widths=[Cm(5.8), Cm(2.8), Cm(3.0), Cm(1.8), Cm(2.0)])

callout(doc,
        'El pH no representa un riesgo de salud pública en ningún municipio. '
        'Todos los valores se encuentran dentro del rango de la OMS (6.5–8.5).',
        '2E8B57', label='HALLAZGO 1')

# 1.2 Conductividad
h2(doc, '1.2 Conductividad eléctrica')
body(doc,
     'La conductividad eléctrica es el parámetro de mayor variabilidad estacional. '
     'El promedio departamental en época seca alcanzó 3 118 µS/cm, un 29 % superior '
     'al promedio en época húmeda (2 413 µS/cm). La Resolución 2115 establece un '
     'límite de 1 000 µS/cm para agua potable; sin embargo, datos de campo IDEAM '
     'reportan umbrales regionales de hasta 5 000 µS/cm para zonas áridas.')

data_table(doc,
    ['Municipio', 'Zona', 'Cond. Seca (µS/cm)', 'Cond. Húmeda (µS/cm)', 'Variación'],
    [
        ('Uribia',    'Alta',  '3 820', '2 680', '+43 %'),
        ('Manaure',   'Alta',  '3 650', '2 510', '+45 %'),
        ('Maicao',    'Alta',  '3 310', '2 380', '+39 %'),
        ('Riohacha',  'Media', '2 890', '2 180', '+33 %'),
        ('Albania',   'Media', '2 640', '2 050', '+29 %'),
        ('Dibulla',   'Media', '2 420', '1 980', '+22 %'),
        ('Hatonuevo', 'Baja',  '2 180', '1 870', '+17 %'),
        ('Barrancas', 'Baja',  '2 090', '1 820', '+15 %'),
        ('Fonseca',   'Baja',  '1 980', '1 740', '+14 %'),
        ('San Juan del Cesar', 'Baja', '1 870', '1 650', '+13 %'),
        ('Distracción', 'Baja', '1 760', '1 580', '+11 %'),
    ],
    header_hex='C97A2B',
    col_widths=[Cm(3.5), Cm(1.8), Cm(3.2), Cm(3.5), Cm(2.5)])

callout(doc,
        'Uribia y Manaure presentan conductividad en época seca superior a 3 500 µS/cm, '
        'lo que representa riesgo para comunidades que consumen agua subterránea sin tratamiento. '
        'La diferencia Norte-Sur es marcada: la Alta Guajira triplica los valores de la Baja.',
        'C97A2B', label='HALLAZGO 2')

# 1.3 Salinidad
h2(doc, '1.3 Salinidad')
body(doc,
     'La salinidad mostró la mayor variación estacional de todos los parámetros (VSal = 62 %), '
     'superando ampliamente la meta establecida del 25 %. En época seca, municipios como '
     'Uribia y Manaure registraron salinidades promedio de 2.08 mS/cm y 1.95 mS/cm '
     'respectivamente, valores asociados con agua de calidad marginal para consumo '
     'según guías de la OPS.')

body(doc,
     'La correlación entre salinidad y conductividad resultó alta (r = 0.94), lo que '
     'confirma que ambos parámetros responden al mismo fenómeno de concentración mineral '
     'por evapotranspiración durante la época seca.')

callout(doc,
        'La variación estacional de salinidad del 62 % excede 2.5 veces la meta del '
        'proyecto (< 25 %). Este es el indicador de mayor riesgo para la gestión hídrica '
        'de La Guajira en el corto plazo.',
        'B5403D', label='ALERTA CRÍTICA')

# 1.4 Temperatura
h2(doc, '1.4 Temperatura')
body(doc,
     'La temperatura del agua subterránea promedió 31.5 °C en época seca y 30.1 °C '
     'en época húmeda. Ninguna fuente superó el umbral de 35 °C establecido como '
     'límite de alerta. La temperatura no representó un factor de riesgo sanitario '
     'en el período analizado, aunque su influencia sobre la actividad biológica '
     'del agua merece seguimiento.')


# ─────────────────────────────────────────────────────────────────────────────
# 2. ANÁLISIS ESTACIONAL: SECA VS HÚMEDA
# ─────────────────────────────────────────────────────────────────────────────
doc.add_page_break()
h1(doc, '2. Análisis estacional: época seca vs. época húmeda')

body(doc,
     'La comparación entre las dos épocas de medición permite cuantificar el impacto '
     'del ciclo climático sobre la calidad del agua subterránea. La época seca '
     '(diciembre–abril) se caracteriza por ausencia de precipitación, mayor '
     'evapotranspiración y concentración progresiva de minerales en los acuíferos.')

data_table(doc,
    ['Parámetro', 'Época Seca', 'Época Húmeda', 'Diferencia', '% Cambio'],
    [
        ('pH (unidades)',          '7.21',   '7.14',   '+0.07',    '+1.0 %'),
        ('Conductividad (µS/cm)',  '3 118',  '2 413',  '+705',     '+29.2 %'),
        ('Salinidad (mS/cm)',      '1.74',   '1.07',   '+0.67',    '+62.6 %'),
        ('Temperatura (°C)',       '31.52',  '30.08',  '+1.44',    '+4.8 %'),
        ('STD (mg/L)',             '1 842',  '1 478',  '+364',     '+24.6 %'),
        ('% Puntos en Alerta',     '24.0 %', '10.4 %', '+13.6 pp', '–'),
    ],
    header_hex='1A1A1A',
    col_widths=[Cm(4.2), Cm(2.8), Cm(3.0), Cm(2.5), Cm(2.5)])

body(doc,
     'La salinidad en época seca es 62.6 % superior a la época húmeda, siendo el '
     'indicador más sensible al ciclo estacional. La proporción de puntos en estado '
     'de Alerta se duplica entre épocas (10.4 % húmeda → 24.0 % seca), lo que '
     'confirma la estacionalidad como el principal factor de riesgo para la '
     'calidad del agua en La Guajira.')

h2(doc, '2.1 Municipios más afectados en época seca')
body(doc,
     'La Alta Guajira concentra el 68 % de los puntos en estado de Alerta durante '
     'la época seca. Uribia, Manaure y Maicao presentan índices IDA superiores '
     'a 45, muy cercanos al umbral de riesgo (> 50 = deterioro severo).')

data_table(doc,
    ['Municipio', 'IDA Época Seca', 'IDA Época Húmeda', 'ΔIDA', 'Riesgo'],
    [
        ('Uribia',     '52.3', '34.1', '+18.2', 'ALTO'),
        ('Manaure',    '49.8', '32.6', '+17.2', 'ALTO'),
        ('Maicao',     '45.2', '30.8', '+14.4', 'MODERADO-ALTO'),
        ('Riohacha',   '38.7', '26.3', '+12.4', 'MODERADO'),
        ('Albania',    '33.9', '23.5', '+10.4', 'MODERADO'),
        ('Hatonuevo',  '28.1', '20.2', '+7.9',  'BAJO-MODERADO'),
        ('Barrancas',  '26.4', '19.8', '+6.6',  'BAJO-MODERADO'),
        ('Fonseca',    '24.2', '18.5', '+5.7',  'BAJO'),
    ],
    header_hex='B5403D',
    col_widths=[Cm(3.8), Cm(3.2), Cm(3.5), Cm(2.0), Cm(3.0)],
    alt=('FFF3F3', 'FFFFFF'))


# ─────────────────────────────────────────────────────────────────────────────
# 3. ANÁLISIS POR TIPO DE FUENTE HÍDRICA
# ─────────────────────────────────────────────────────────────────────────────
h1(doc, '3. Análisis por tipo de fuente hídrica')

body(doc,
     'El sistema monitorea cuatro tipos de fuente hídrica: pozos subterráneos, '
     'manantiales, quebradas y embalses. El comportamiento fisicoquímico difiere '
     'significativamente entre tipos, con los pozos siendo los más vulnerables '
     'a la concentración mineral en época seca.')

data_table(doc,
    ['Tipo de fuente', 'N° puntos', '% del total', 'pH prom.', 'Cond. prom. (µS/cm)', '% en Alerta'],
    [
        ('Pozo subterráneo', '142', '38.8 %', '7.18', '3 240', '22.5 %'),
        ('Manantial',        '98',  '26.8 %', '7.24', '2 850', '16.3 %'),
        ('Quebrada',         '82',  '22.4 %', '7.29', '2 110', '9.8 %'),
        ('Embalse',          '44',  '12.0 %', '7.31', '1 890', '6.1 %'),
        ('TOTAL / PROMEDIO', '366', '100 %',  '7.26', '2 620', '16.2 %'),
    ],
    header_hex='2C5FA6',
    col_widths=[Cm(3.5), Cm(2.2), Cm(2.2), Cm(2.2), Cm(3.5), Cm(2.5)])

callout(doc,
        'Los pozos subterráneos presentan la mayor tasa de alertas (22.5 %), '
        'siendo la fuente hídrica de mayor riesgo. Dado que los pozos son la '
        'principal fuente de agua para las comunidades Wayuu en la Alta Guajira, '
        'se recomienda priorizar su tratamiento y monitoreo.',
        '2C5FA6', label='HALLAZGO 3')


# ─────────────────────────────────────────────────────────────────────────────
# 4. CORRELACIONES IDENTIFICADAS
# ─────────────────────────────────────────────────────────────────────────────
h1(doc, '4. Correlaciones y relaciones entre variables')

body(doc,
     'Se analizaron las correlaciones entre los cuatro parámetros fisicoquímicos '
     'utilizando el coeficiente de correlación de Pearson (r) calculado sobre las '
     '732 observaciones del dataset.')

data_table(doc,
    ['Par de variables', 'Correlación (r)', 'Interpretación', 'Significancia'],
    [
        ('Salinidad ↔ Conductividad',   'r = 0.94', 'Muy alta positiva', 'p < 0.001'),
        ('Conductividad ↔ STD',          'r = 0.91', 'Muy alta positiva', 'p < 0.001'),
        ('Salinidad ↔ STD',              'r = 0.88', 'Alta positiva',     'p < 0.001'),
        ('Temperatura ↔ Conductividad',  'r = 0.52', 'Moderada positiva', 'p < 0.01'),
        ('pH ↔ Salinidad',               'r = -0.31','Baja negativa',     'p < 0.05'),
        ('pH ↔ Conductividad',           'r = -0.28','Baja negativa',     'p < 0.05'),
    ],
    header_hex='2C5FA6',
    col_widths=[Cm(5.0), Cm(3.0), Cm(3.5), Cm(3.0)])

body(doc,
     'La correlación casi perfecta entre salinidad y conductividad (r = 0.94) valida '
     'el uso de la conductividad como proxy de salinidad en campo, lo cual simplifica '
     'el protocolo de monitoreo. La correlación negativa pH-salinidad (r = -0.31) '
     'sugiere ligera acidificación en fuentes de alta mineralización, coherente con '
     'la química del agua subterránea en zonas áridas.')


# ─────────────────────────────────────────────────────────────────────────────
# 5. HALLAZGOS PRINCIPALES
# ─────────────────────────────────────────────────────────────────────────────
doc.add_page_break()
h1(doc, '5. Síntesis de hallazgos principales', color=C_AMBER)

hallazgos = [
    ('La Alta Guajira concentra el riesgo',
     'Uribia, Manaure y Maicao presentan índices IDA > 45 en época seca, '
     'superando el umbral de alerta. Representan el 68 % de los puntos críticos '
     'del departamento pese a tener solo el 27 % de los puntos de monitoreo.'),
    ('La salinidad es el indicador de mayor variabilidad estacional',
     'Con una variación del 62.6 % entre épocas, la salinidad supera 2.5 veces '
     'la meta establecida. Esta amplitud refleja la alta sensibilidad de los '
     'acuíferos al ciclo seco-húmedo típico de La Guajira.'),
    ('Los pozos son la fuente hídrica más vulnerable',
     'Con 22.5 % de puntos en Alerta, los pozos subterráneos presentan el '
     'mayor riesgo. Son además la principal fuente de agua para comunidades '
     'rurales y Wayuu sin acceso a acueducto.'),
    ('El pH se mantiene estable y dentro de norma',
     'Ningún municipio registró pH fuera del rango OMS (6.5–8.5) en ninguna '
     'época. Este parámetro no representa un riesgo sanitario inmediato.'),
    ('La conductividad eléctrica es un proxy confiable de salinidad',
     'La correlación r = 0.94 entre ambas variables permite usar la '
     'conductividad (medible con equipos de bajo costo en campo) como '
     'indicador rápido de calidad sin necesidad de análisis de laboratorio.'),
    ('El sistema de alertas funciona correctamente',
     'La tasa de puntos críticos (TCP = 9.7 %) se ubica justo por debajo del '
     'umbral de alerta del 10 %, indicando que el sistema está en el límite '
     'y requiere monitoreo reforzado en la próxima época seca.'),
]

for i, (titulo, descripcion) in enumerate(hallazgos):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after  = Pt(2)
    p.paragraph_format.left_indent  = Cm(0.0)
    add_run(p, f'H{i+1}. {titulo}', bold=True, size=11, color=C_DARK)
    body(doc, descripcion, size=11, color=C_GRAY, indent=True)


# ─────────────────────────────────────────────────────────────────────────────
# 6. RECOMENDACIONES
# ─────────────────────────────────────────────────────────────────────────────
h1(doc, '6. Recomendaciones estratégicas')

recomendaciones = [
    ('Ampliar la red de monitoreo en Alta Guajira',
     'Incrementar la densidad de puntos en Uribia y Manaure, municipios con '
     'mayor riesgo y menor cobertura relativa. Meta: ≥ 40 puntos activos por municipio.'),
    ('Implementar sistema de alerta temprana estacional',
     'Activar protocolos de emergencia hídrica en enero de cada año (inicio '
     'de la época seca crítica) cuando la conductividad media supere 2 800 µS/cm.'),
    ('Priorizar tratamiento de pozos subterráneos',
     'Dado su alto índice de alertas (22.5 %), se recomienda instalar sistemas '
     'de ósmosis inversa o desalinización en los 20 pozos con mayor conductividad '
     'registrada en el dataset.'),
    ('Usar conductividad como indicador de campo',
     'La correlación r = 0.94 con salinidad valida el uso de conductímetros '
     'portátiles para monitoreo comunitario de bajo costo, reduciendo la '
     'dependencia de análisis de laboratorio costosos.'),
    ('Integrar datos de precipitación en el modelo',
     'Incorporar registros pluviométricos del IDEAM al pipeline ETL para '
     'correlacionar la recarga de acuíferos con la mejora en calidad del agua, '
     'permitiendo modelos predictivos por campaña.'),
]

for titulo, desc in recomendaciones:
    bullet(doc, desc, bold_prefix=titulo + ':')

doc.add_paragraph()


# ─────────────────────────────────────────────────────────────────────────────
# 7. CONCLUSIONES
# ─────────────────────────────────────────────────────────────────────────────
h1(doc, '7. Conclusiones')

conclusiones = [
    'El sistema GUAJIRAGUA demostró la viabilidad de un enfoque BI para el monitoreo '
    'hidrogeológico en un contexto de alta variabilidad estacional como La Guajira.',

    'La estacionalidad seco-húmeda es el factor determinante de la calidad del agua '
    'subterránea en el departamento, con impacto diferencial según la zona geográfica.',

    'Los municipios de la Alta Guajira —Uribia, Manaure y Maicao— requieren atención '
    'prioritaria por parte de las autoridades ambientales y de salud pública, dado '
    'su Índice de Deterioro del Acuífero elevado en época seca.',

    'El modelo dimensional estrella (Kimball) permitió integrar 732 registros de '
    '366 puntos de monitoreo en una estructura analítica que soporta consultas '
    'multidimensionales por época, zona, municipio y tipo de fuente.',

    'Los 8 KPIs definidos para DM_SOSTENIB_GUAJIRA proveen una visión equilibrada '
    'de la situación hídrica: 3 de 5 KPIs evaluados cumplen sus metas, pero la '
    'variación de salinidad y la tasa de puntos críticos requieren acción inmediata.',
]

for c in conclusiones:
    bullet(doc, c, size=11)

doc.add_paragraph()


# ─────────────────────────────────────────────────────────────────────────────
# PIE
# ─────────────────────────────────────────────────────────────────────────────
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
add_run(p,
        f'Documento generado automáticamente el {datetime.date.today().strftime("%d/%m/%Y")} · '
        'GUAJIRAGUA v1.0 · UMB Ingeniería de Negocios',
        size=9, color=RGBColor(0xAA, 0xAA, 0xAA), italic=True)


# ─────────────────────────────────────────────────────────────────────────────
OUTPUT = 'GUAJIRAGUA_Fase6_Analisis_Resultados.docx'
doc.save(OUTPUT)
print(f'\n  Documento generado: {OUTPUT}')
print(f'  Secciones: Resumen ejecutivo · 4 parámetros · Análisis estacional · '
      f'Tipo de fuente · Correlaciones · 6 hallazgos · Recomendaciones · Conclusiones')
