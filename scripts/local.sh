#!/bin/bash

echo "🚀 Initializing Local Development Environment for PolyMicro..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18+."
    exit 1
fi

echo "✅ Node.js is installed: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Setup environment variables
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️ Please review the .env file and configure your DATABASE_TYPE (mongodb or firebase)."
else
    echo "✅ .env file already exists."
fi

# Start the development server
echo "🔥 Starting the development server..."
npm run dev
