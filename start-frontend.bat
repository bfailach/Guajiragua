@echo off
title Guajiragua Frontend (puerto 3001)
cd /d "%~dp0"
python -m http.server 3001
pause
