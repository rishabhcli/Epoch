@echo off
REM Epoch Pod - Development Setup Script (Windows)
REM This script sets up a local development environment with sample data

echo.
echo 🚀 Epoch Pod - Development Setup
echo ==================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: Please run this script from the repository root
    exit /b 1
)

REM Check for required environment variables
if not exist "apps\web\.env.local" (
    echo ⚠️  Warning: apps\web\.env.local not found
    echo.
    echo Please create apps\web\.env.local with the following variables:
    echo   - DATABASE_URL ^(PostgreSQL connection string^)
    echo   - OPENAI_API_KEY ^(for AI generation^)
    echo   - BLOB_READ_WRITE_TOKEN ^(for Vercel Blob storage^)
    echo   - AUTH_SECRET ^(generate with: openssl rand -base64 32^)
    echo.
    set /p continue="Continue anyway? (y/N) "
    if /i not "%continue%"=="y" exit /b 1
)

echo 📦 Step 1: Installing dependencies...
echo ------------------------------------
call npm install
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    exit /b 1
)
echo ✅ Dependencies installed
echo.

echo 🗄️  Step 2: Setting up database...
echo ------------------------------------
cd apps\web

echo Running migrations...
call npx prisma migrate dev --name init
if errorlevel 1 (
    echo ⚠️  Warning: Migration failed
    echo Make sure your DATABASE_URL is correct in apps\web\.env.local
    cd ..\..
    exit /b 1
)

echo Generating Prisma Client...
call npx prisma generate
if errorlevel 1 (
    echo ❌ Failed to generate Prisma Client
    cd ..\..
    exit /b 1
)

echo ✅ Database setup complete
echo.

echo 🌱 Step 3: Seeding sample data...
echo ------------------------------------
echo This will create:
echo   - 2 sample interviews ^(Einstein, Cleopatra^)
echo   - 2 sample debates ^(Napoleon, Columbus^)
echo   - 1 sample adventure ^(Roman Senator - 11 episodes^)
echo.

call npx prisma db seed
if errorlevel 1 (
    echo ❌ Failed to seed database
    cd ..\..
    exit /b 1
)

echo ✅ Sample data seeded
echo.

cd ..\..

echo 🎉 Setup Complete!
echo ==================
echo.
echo Your development environment is ready. Next steps:
echo.
echo 1. Start the development server:
echo    npm run dev
echo.
echo 2. Open your browser to:
echo    http://localhost:3000
echo.
echo 3. Explore sample content:
echo    - Interviews: http://localhost:3000/episodes
echo    - Debates: http://localhost:3000/episodes
echo    - Adventures: http://localhost:3000/adventures
echo.
echo 4. Generate new content:
echo    - http://localhost:3000/dashboard/interviews/new
echo    - http://localhost:3000/dashboard/debates/new
echo    - http://localhost:3000/dashboard/adventures/new
echo.
echo 5. View database in Prisma Studio:
echo    npm run db:studio
echo.
echo Happy coding! 🎧
