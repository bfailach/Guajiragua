"""
database.py — Cliente Supabase (REST/HTTPS, sin psycopg2)
Guajiragua · Sistema BI Hidrogeológico
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError(
        "Faltan SUPABASE_URL o SUPABASE_KEY en api/.env\n"
        "Copia api/.env.example → api/.env y rellena tus credenciales."
    )


def get_client() -> Client:
    """Retorna un cliente Supabase listo para usar."""
    return create_client(SUPABASE_URL, SUPABASE_KEY)
