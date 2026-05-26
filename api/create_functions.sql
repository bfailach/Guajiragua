-- ============================================================
--  GUAJIRAGUA — Funciones SQL para el API (RPC via supabase-py)
--  Ejecutar en: Supabase → SQL Editor  DESPUÉS de schema.sql
-- ============================================================

-- 1. KPIs globales filtrados por época
CREATE OR REPLACE FUNCTION get_kpis(p_temporada text DEFAULT NULL)
RETURNS json
LANGUAGE sql STABLE AS $$
  SELECT json_build_object(
    'total',         COUNT(*),
    'activos',       SUM(CASE WHEN p.activo        THEN 1 ELSE 0 END),
    'criticos',      SUM(CASE WHEN f.estado = 'Crítico'    THEN 1 ELSE 0 END),
    'precaucion',    SUM(CASE WHEN f.estado = 'Precaución' THEN 1 ELSE 0 END),
    'aptos',         SUM(CASE WHEN f.estado = 'Apta'       THEN 1 ELSE 0 END),
    'ph_promedio',   ROUND(AVG(f.ph)::numeric,            3),
    'cond_promedio', ROUND(AVG(f.conductividad)::numeric,  1),
    'sal_promedio',  ROUND(AVG(f.salinidad)::numeric,      3),
    'temp_promedio', ROUND(AVG(f.temperatura)::numeric,    2)
  )
  FROM fact_medicion f
  JOIN dim_punto  p ON p.id_punto   = f.id_punto
  JOIN dim_tiempo t ON t.id_tiempo  = f.id_tiempo
  WHERE p_temporada IS NULL OR t.temporada = p_temporada;
$$;


-- 2. Agregados por municipio filtrados por época
CREATE OR REPLACE FUNCTION get_municipios(p_temporada text DEFAULT NULL)
RETURNS json
LANGUAGE sql STABLE AS $$
  SELECT json_agg(row_to_json(q))
  FROM (
    SELECT
      m.id_municipio                                            AS id,
      m.nombre                                                  AS name,
      m.zona,
      m.lat,
      m.lon,
      COUNT(f.id_medicion)                                      AS n,
      SUM(CASE WHEN p.activo THEN 1 ELSE 0 END)                 AS activos,
      ROUND(AVG(f.ph)::numeric,            2)                   AS ph,
      ROUND(AVG(f.conductividad)::numeric,  0)                  AS cond,
      ROUND(AVG(f.salinidad)::numeric,      2)                  AS sal,
      ROUND(AVG(f.temperatura)::numeric,    1)                  AS temp,
      ROUND(AVG(f.std_mg_l)::numeric,       0)                  AS std,
      SUM(CASE WHEN f.estado = 'Crítico'    THEN 1 ELSE 0 END)  AS criticos,
      SUM(CASE WHEN f.estado = 'Apta'       THEN 1 ELSE 0 END)  AS apta,
      SUM(CASE WHEN f.estado = 'Precaución' THEN 1 ELSE 0 END)  AS precaucion
    FROM dim_municipio m
    LEFT JOIN fact_medicion f ON f.id_municipio = m.id_municipio
    LEFT JOIN dim_punto     p ON p.id_punto      = f.id_punto
    LEFT JOIN dim_tiempo    t ON t.id_tiempo     = f.id_tiempo
    WHERE p_temporada IS NULL OR t.temporada = p_temporada
    GROUP BY m.id_municipio, m.nombre, m.zona, m.lat, m.lon
    ORDER BY m.zona, m.nombre
  ) q;
$$;


-- 3. Serie temporal (promedio real por época × zona)
CREATE OR REPLACE FUNCTION get_serie_base(p_variable text, p_zona text DEFAULT NULL)
RETURNS json
LANGUAGE sql STABLE AS $$
  SELECT json_build_object(
    'base_seca', (
      SELECT ROUND(AVG(
        CASE p_variable
          WHEN 'ph'   THEN f.ph
          WHEN 'sal'  THEN f.salinidad
          WHEN 'cond' THEN f.conductividad
          WHEN 'temp' THEN f.temperatura
        END
      )::numeric, 4)
      FROM fact_medicion f
      JOIN dim_tiempo    t ON t.id_tiempo    = f.id_tiempo
      JOIN dim_municipio m ON m.id_municipio = f.id_municipio
      WHERE t.temporada = 'Seca'
        AND (p_zona IS NULL OR m.zona = p_zona)
    ),
    'base_hum', (
      SELECT ROUND(AVG(
        CASE p_variable
          WHEN 'ph'   THEN f.ph
          WHEN 'sal'  THEN f.salinidad
          WHEN 'cond' THEN f.conductividad
          WHEN 'temp' THEN f.temperatura
        END
      )::numeric, 4)
      FROM fact_medicion f
      JOIN dim_tiempo    t ON t.id_tiempo    = f.id_tiempo
      JOIN dim_municipio m ON m.id_municipio = f.id_municipio
      WHERE t.temporada = 'Húmeda'
        AND (p_zona IS NULL OR m.zona = p_zona)
    )
  );
$$;


-- 4. Alertas activas
CREATE OR REPLACE FUNCTION get_alertas(p_limit int DEFAULT 50)
RETURNS json
LANGUAGE sql STABLE AS $$
  SELECT json_agg(row_to_json(q))
  FROM (
    SELECT
      f.id_medicion,
      f.id_punto,
      m.nombre        AS muni,
      m.id_municipio,
      p.tipo,
      t.temporada,
      t.fecha::text   AS fecha,
      f.ph,
      f.conductividad,
      f.salinidad,
      f.estado,
      CASE
        WHEN f.salinidad     > 4.0  THEN 'crit'
        WHEN f.conductividad > 5000 THEN 'crit'
        WHEN f.ph < 6.0 OR f.ph > 9.0 THEN 'crit'
        ELSE 'warn'
      END AS severidad,
      CASE
        WHEN f.salinidad     > 4.0  THEN 'SAL > 4.0'
        WHEN f.conductividad > 5000 THEN 'COND > 5000'
        WHEN f.ph < 6.0             THEN 'pH < 6.0'
        WHEN f.ph > 9.0             THEN 'pH > 9.0'
        ELSE 'PRECAUCIÓN'
      END AS codigo
    FROM fact_medicion f
    JOIN dim_punto     p ON p.id_punto      = f.id_punto
    JOIN dim_municipio m ON m.id_municipio  = f.id_municipio
    JOIN dim_tiempo    t ON t.id_tiempo     = f.id_tiempo
    WHERE f.estado IN ('Crítico', 'Precaución')
    ORDER BY
      CASE f.estado WHEN 'Crítico' THEN 0 ELSE 1 END,
      t.fecha DESC
    LIMIT p_limit
  ) q;
$$;
