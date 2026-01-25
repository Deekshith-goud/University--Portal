@echo off
cd /d "%~dp0"
echo Starting Student Portal Backend...
echo.
echo ==================================================
echo  YOUR LOCAL IP ADDRESSES:
echo ==================================================
ipconfig | findstr /i "IPv4"
echo ==================================================
echo.
echo 1. Look for the 'IPv4 Address' above (e.g., 192.168.1.5 or 10.0.0.5)
echo 2. On your phone, make sure you are on the SAME WiFi.
echo 3. The backend is running on Port 8000.
echo.
echo Starting Server on 0.0.0.0:8000 ...
echo.
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
pause
