#!/bin/bash

# Epoch Pod - Development Setup Script
# This script sets up a local development environment with sample data

set -e  # Exit on error

echo "🚀 Epoch Pod - Development Setup"
echo "=================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the repository root"
    exit 1
fi

# Check for required environment variables
if [ ! -f "apps/web/.env.local" ]; then
    echo "⚠️  Warning: apps/web/.env.local not found"
    echo ""
    echo "Please create apps/web/.env.local with the following variables:"
    echo "  - DATABASE_URL (PostgreSQL connection string)"
    echo "  - OPENAI_API_KEY (for AI generation)"
    echo "  - BLOB_READ_WRITE_TOKEN (for Vercel Blob storage)"
    echo "  - AUTH_SECRET (generate with: openssl rand -base64 32)"
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "📦 Step 1: Installing dependencies..."
echo "------------------------------------"
npm install
echo "✅ Dependencies installed"
echo ""

echo "🗄️  Step 2: Setting up database..."
echo "------------------------------------"
cd apps/web

# Check if database is accessible
if ! npx prisma db execute --stdin <<< "SELECT 1" > /dev/null 2>&1; then
    echo "⚠️  Warning: Cannot connect to database"
    echo "Make sure your DATABASE_URL is correct in apps/web/.env.local"
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        cd ../..
        exit 1
    fi
fi

echo "Running migrations..."
npx prisma migrate dev --name init

echo "Generating Prisma Client..."
npx prisma generate

echo "✅ Database setup complete"
echo ""

echo "🌱 Step 3: Seeding sample data..."
echo "------------------------------------"
echo "This will create:"
echo "  - 2 sample interviews (Einstein, Cleopatra)"
echo "  - 2 sample debates (Napoleon, Columbus)"
echo "  - 1 sample adventure (Roman Senator - 11 episodes)"
echo ""

npx prisma db seed

echo "✅ Sample data seeded"
echo ""

cd ../..

echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "Your development environment is ready. Next steps:"
echo ""
echo "1. Start the development server:"
echo "   npm run dev"
echo ""
echo "2. Open your browser to:"
echo "   http://localhost:3000"
echo ""
echo "3. Explore sample content:"
echo "   - Interviews: http://localhost:3000/episodes"
echo "   - Debates: http://localhost:3000/episodes"
echo "   - Adventures: http://localhost:3000/adventures"
echo ""
echo "4. Generate new content:"
echo "   - http://localhost:3000/dashboard/interviews/new"
echo "   - http://localhost:3000/dashboard/debates/new"
echo "   - http://localhost:3000/dashboard/adventures/new"
echo ""
echo "5. View database in Prisma Studio:"
echo "   npm run db:studio"
echo ""
echo "Happy coding! 🎧"
