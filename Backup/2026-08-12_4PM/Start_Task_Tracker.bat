@echo off
title Task Tracker Server
echo =========================================
echo Kh?i d?ng Server cho Task Tracker...
echo =========================================
cd /d "%~dp0"

echo Dang chay npm run dev...
echo Vui long mo trinh duyet va truy cap: http://localhost:5173
echo De tat server, bam tat cua so nay hoac an Ctrl+C.
echo.

start http://localhost:5173
npm run dev
pause
