-- ============================================================
--  GUAJIRAGUA — Star Schema Kimball
--  Sistema BI Hidrogeológico · La Guajira
--  Ejecutar en: Supabase → SQL Editor
-- ============================================================

-- 1. DIMENSIÓN MUNICIPIO
CREATE TABLE IF NOT EXISTS dim_municipio (
  id_municipio  VARCHAR(3)   PRIMARY KEY,           -- URI, MAN, MAI…
  nombre        VARCHAR(100) NOT NULL,
  zona          VARCHAR(10)  NOT NULL CHECK (zona IN ('Alta','Media','Baja')),
  lat           DECIMAL(9,6),
  lon           DECIMAL(9,6),
  codigo_dane   VARCHAR(5)
);

-- 2. DIMENSIÓN PUNTO DE MONITOREO
CREATE TABLE IF NOT EXISTS dim_punto (
  id_punto      VARCHAR(20)  PRIMARY KEY,           -- GJ-00001…
  id_municipio  VARCHAR(3)   REFERENCES dim_municipio(id_municipio),
  tipo          VARCHAR(20)  CHECK (tipo IN ('Pozo','Aljibe','Manantial')),
  uso           VARCHAR(30),
  metodo        VARCHAR(60),
  lat           DECIMAL(9,6),
  lon           DECIMAL(9,6),
  prof_m        DECIMAL(6,1),
  activo        BOOLEAN      DEFAULT TRUE
);

-- 3. DIMENSIÓN TIEMPO
CREATE TABLE IF NOT EXISTS dim_tiempo (
  id_tiempo     SERIAL       PRIMARY KEY,
  fecha         DATE         NOT NULL,
  anio          SMALLINT,
  mes           SMALLINT,
  trimestre     VARCHAR(2),
  nombre_mes    VARCHAR(20),
  temporada     VARCHAR(10)  CHECK (temporada IN ('Seca','Húmeda')),
  UNIQUE (fecha, temporada)
);

-- 4. TABLA DE HECHOS
CREATE TABLE IF NOT EXISTS fact_medicion (
  id_medicion   VARCHAR(20)  PRIMARY KEY,           -- GJ-00001
  id_punto      VARCHAR(20)  REFERENCES dim_punto(id_punto),
  id_municipio  VARCHAR(3)   REFERENCES dim_municipio(id_municipio),
  id_tiempo     INTEGER      REFERENCES dim_tiempo(id_tiempo),
  ph            DECIMAL(5,3),
  conductividad DECIMAL(8,1),
  salinidad     DECIMAL(6,3),
  temperatura   DECIMAL(5,2),
  std_mg_l      DECIMAL(8,1),
  estado        VARCHAR(15)  CHECK (estado IN ('Apta','Precaución','Crítico')),
  created_at    TIMESTAMPTZ  DEFAULT NOW()
);

-- 5. ÍNDICES para consultas BI frecuentes
CREATE INDEX IF NOT EXISTS idx_fact_municipio  ON fact_medicion(id_municipio);
CREATE INDEX IF NOT EXISTS idx_fact_tiempo     ON fact_medicion(id_tiempo);
CREATE INDEX IF NOT EXISTS idx_fact_estado     ON fact_medicion(estado);
CREATE INDEX IF NOT EXISTS idx_fact_punto      ON fact_medicion(id_punto);
CREATE INDEX IF NOT EXISTS idx_tiempo_temp     ON dim_tiempo(temporada);

-- 6. VISTA: KPIs globales (útil para el API)
CREATE OR REPLACE VIEW vw_kpis AS
SELECT
  COUNT(*)                                          AS total_mediciones,
  COUNT(DISTINCT f.id_punto)                        AS total_puntos,
  SUM(CASE WHEN p.activo THEN 1 ELSE 0 END)         AS puntos_activos,
  SUM(CASE WHEN f.estado = 'Crítico'    THEN 1 ELSE 0 END) AS puntos_criticos,
  SUM(CASE WHEN f.estado = 'Precaución' THEN 1 ELSE 0 END) AS puntos_precaucion,
  SUM(CASE WHEN f.estado = 'Apta'       THEN 1 ELSE 0 END) AS puntos_aptos,
  ROUND(AVG(f.ph)::NUMERIC,           3)            AS ph_promedio,
  ROUND(AVG(f.conductividad)::NUMERIC, 1)           AS cond_promedio,
  ROUND(AVG(f.salinidad)::NUMERIC,     3)           AS sal_promedio,
  ROUND(AVG(f.temperatura)::NUMERIC,   2)           AS temp_promedio
FROM fact_medicion f
JOIN dim_punto p ON p.id_punto = f.id_punto;

-- 7. VISTA: Agregados por municipio
CREATE OR REPLACE VIEW vw_municipios AS
SELECT
  m.id_municipio,
  m.nombre,
  m.zona,
  m.lat,
  m.lon,
  COUNT(f.id_medicion)                              AS n,
  SUM(CASE WHEN p.activo THEN 1 ELSE 0 END)         AS activos,
  ROUND(AVG(f.ph)::NUMERIC,           2)            AS ph,
  ROUND(AVG(f.conductividad)::NUMERIC, 0)           AS cond,
  ROUND(AVG(f.salinidad)::NUMERIC,     2)           AS sal,
  ROUND(AVG(f.temperatura)::NUMERIC,   1)           AS temp,
  ROUND(AVG(f.std_mg_l)::NUMERIC,      0)           AS std,
  SUM(CASE WHEN f.estado = 'Crítico'    THEN 1 ELSE 0 END) AS criticos,
  SUM(CASE WHEN f.estado = 'Apta'       THEN 1 ELSE 0 END) AS apta
FROM dim_municipio m
LEFT JOIN fact_medicion f ON f.id_municipio = m.id_municipio
LEFT JOIN dim_punto p     ON p.id_punto = f.id_punto
GROUP BY m.id_municipio, m.nombre, m.zona, m.lat, m.lon;
