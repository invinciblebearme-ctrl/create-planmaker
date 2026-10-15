@echo off
chcp 65001 > nul
echo ========================================================
echo   CREATE Planmaker (수업 설계 도우미) Cloudflare Pages 배포
echo ========================================================
echo.

set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "%~dp0"

echo [1/2] 프로덕션 빌드를 시작합니다...
call npm.cmd run build
if %ERRORLEVEL% neq 0 (
  echo [오류] 빌드에 실패했습니다.
  pause
  exit /b %ERRORLEVEL%
)

echo.
echo [2/2] Cloudflare Pages 배포를 진행합니다...
call npx.cmd wrangler pages deploy dist --project-name create-planmaker --branch main

echo.
echo ========================================================
echo 배포 작업이 완료되었습니다.
echo ========================================================
pause
