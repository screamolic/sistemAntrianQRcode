#!/bin/bash
# Setup script for Queue Automation

echo "Setting up Queue Automation..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Generate Prisma Client (this works without database)
echo "Generating Prisma Client..."
npx prisma generate

echo ""
echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Set up PostgreSQL (see DATABASE_SETUP.md)"
echo "2. Run: npx prisma migrate dev"
echo "3. Run: npm run dev"
