@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
title The Deep State Engine - zdjecia

echo.
echo   Pobieranie zdjęć do kart wydarzeń (Wikimedia Commons, domena publiczna)
echo   ------------------------------------------------------------------------
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo   Nie znaleziono programu Node.js.
  echo   Zainstaluj wersję LTS ze strony https://nodejs.org i uruchom ten plik ponownie.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules\tsx" (
  echo   Pierwsze uruchomienie: pobieram potrzebne pakiety. To potrwa minutę lub dwie.
  echo.
  call npm install
  if errorlevel 1 (
    echo.
    echo   Pobieranie pakietów nie powiodło się. Sprawdź połączenie z internetem i spróbuj ponownie.
    echo.
    pause
    exit /b 1
  )
)

call npm run zdjecia
echo.
echo   Zdjęcia są w folderze data\images\pliki. Odśwież stronę gry, żeby je zobaczyć.
echo.
pause
