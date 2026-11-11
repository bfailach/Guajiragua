"""
crear_admin.py — Genera las credenciales del administrador

    cd api
    python crear_admin.py

Pide usuario y contraseña, y muestra las tres variables de entorno que hay que
poner en api/.env (local) y en el panel de Render (producción).
La contraseña nunca se guarda: solo su hash.
"""

import getpass
import secrets
import sys

from auth import hash_password

MIN_LEN = 12


def main():
    user = input("Usuario administrador: ").strip()
    if not user:
        sys.exit("El usuario no puede estar vacío.")

    pwd = getpass.getpass(f"Contraseña (mín. {MIN_LEN} caracteres): ")
    if len(pwd) < MIN_LEN:
        sys.exit(f"La contraseña debe tener al menos {MIN_LEN} caracteres.")
    if getpass.getpass("Repita la contraseña: ") != pwd:
        sys.exit("Las contraseñas no coinciden.")

    print("\nCopie estas líneas en api/.env y en Render → Environment:\n")
    print(f"ADMIN_USER={user}")
    print(f"ADMIN_PASSWORD_HASH={hash_password(pwd)}")
    print(f"AUTH_SECRET={secrets.token_urlsafe(48)}")
    print("\nNo comparta AUTH_SECRET ni lo suba al repositorio.")


if __name__ == "__main__":
    main()
