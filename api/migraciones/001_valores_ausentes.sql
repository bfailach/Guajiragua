-- 001_valores_ausentes.sql
-- Corrige en una base ya cargada los valores ausentes que se registraron como
-- números y recalcula el estado con la regla única del sistema (api/calidad.py).
--
-- Ejecutar una vez en el editor SQL de Supabase. Es idempotente: volver a
-- ejecutarlo no cambia nada. Una base cargada desde cero con la versión actual
-- de real-data.js y load_to_supabase.py ya queda corregida y no lo necesita.

BEGIN;

-- Salinidad, STD y temperatura en 0: el sensor no registró el dato
UPDATE fact_medicion SET salinidad   = NULL WHERE salinidad   = 0;
UPDATE fact_medicion SET std_mg_l    = NULL WHERE std_mg_l    = 0;
UPDATE fact_medicion SET temperatura = NULL WHERE temperatura = 0;

-- Profundidad de 10 m: valor de relleno usado cuando no se midió
UPDATE dim_punto SET prof_m = NULL WHERE prof_m = 10;

-- Estado según la regla única (mantener sincronizado con api/calidad.py)
UPDATE fact_medicion SET estado = CASE
    WHEN conductividad > 5000 OR salinidad > 4.0 OR ph < 6.0 OR ph > 9.0 THEN 'Crítico'
    WHEN conductividad > 2500 OR ph < 6.5 OR ph > 8.5                     THEN 'Precaución'
    ELSE 'Apta'
  END;

COMMIT;
