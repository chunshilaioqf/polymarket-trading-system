#!/bin/bash

echo "🚀 Initializing Production/Online Environment for PolyMicro..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18+."
    exit 1
fi

echo "✅ Node.js is installed: $(node -v)"

# Install dependencies (including devDependencies for build)
echo "📦 Installing dependencies..."
npm install

# Setup environment variables
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️ WARNING: You must configure the .env file with production values before starting!"
    echo "Please edit .env and then run this script again or run 'npm start'."
    exit 1
else
    echo "✅ .env file found."
fi

# Build the application
echo "🏗️ Building the application..."
npm run build

# Start the production server
echo "🌟 Starting the production server..."
npm start
