@echo off
title Portal de Pedidos - Aula
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo O Node.js nao foi encontrado neste computador.
  echo Instale o Node.js 18 ou superior e tente novamente.
  echo.
  pause
  exit /b 1
)
set PORT=3100
start "" http://localhost:3100
node server.mjs
pause
