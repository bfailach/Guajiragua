@echo off
title Guajiragua API (puerto 8000)
cd /d "%~dp0api"
python -m uvicorn main:app --port 8000
pause
