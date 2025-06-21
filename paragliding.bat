@echo off
REM Avvia server Node.js in background
start "" cmd /k "node server.js"

REM Attendi 2 secondi per far partire il server (puoi aumentare se necessario)
timeout /t 2 /nobreak >nul

REM Apri Microsoft Edge sulla homepage
start msedge http://localhost:3002
