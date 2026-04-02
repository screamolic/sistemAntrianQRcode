@echo off
echo ========================================
echo PostgreSQL Local Setup for Queue App
echo ========================================
echo.

REM Check if psql is available
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] PostgreSQL not found!
    echo.
    echo Please install PostgreSQL from:
    echo https://www.postgresql.org/download/windows/
    echo.
    echo Or install via winget:
    echo winget install PostgreSQL.PostgreSQL
    echo.
    pause
    exit /b 1
)

echo [OK] PostgreSQL found!
echo.

REM Create database
echo Creating database 'queue_automation'...
psql -U postgres -c "CREATE DATABASE queue_automation;" 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Database created successfully!
) else (
    echo [INFO] Database might already exist
)
echo.

REM Run migrations
echo Running Drizzle migrations...
npx drizzle-kit migrate

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo [SUCCESS] Database setup complete!
    echo ========================================
    echo.
    echo You can now:
    echo 1. Start dev server: npm run dev
    echo 2. Open browser: http://localhost:3000
    echo 3. Create admin account at /signup
    echo.
) else (
    echo.
    echo [ERROR] Migration failed!
    echo Please check your DATABASE_URL in .env file
    echo.
)

pause
