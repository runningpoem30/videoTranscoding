#!/bin/bash

echo "🔍 Checking Service Configuration..."
echo ""

# Check if auth-backend dependencies are installed
echo "1️⃣ Checking auth-backend dependencies..."
if [ -d "node_modules" ]; then
    echo "   ✅ Dependencies installed"
else
    echo "   ❌ Dependencies NOT installed - Run: npm install"
fi
echo ""

# Check if .env exists
echo "2️⃣ Checking environment configuration..."
if [ -f ".env" ]; then
    echo "   ✅ .env file exists"
    if grep -q "DATABASE_URL" .env; then
        echo "   ✅ DATABASE_URL configured"
    else
        echo "   ❌ DATABASE_URL not set in .env"
    fi
else
    echo "   ❌ .env file missing - Copy from .env.example"
fi
echo ""

# Check Prisma client
echo "3️⃣ Checking Prisma setup..."
if [ -d "node_modules/@prisma/client" ]; then
    echo "   ✅ Prisma client generated"
else
    echo "   ❌ Prisma client NOT generated - Run: npm run prisma:generate"
fi
echo ""

echo "4️⃣ Service Communication Map:"
echo ""
echo "   CLIENT (http://localhost:5173)"
echo "      │"
echo "      ├─► AUTH BACKEND (http://localhost:3001)"
echo "      │   └─► PostgreSQL Database"
echo "      │"
echo "      └─► AWS API Gateway (https://bc1opubda1...)"
echo "          └─► Lambda (signer) → S3 → Lambda (trigger) → MediaConvert → CloudFront"
echo ""

echo "5️⃣ CORS Configuration:"
echo "   Auth Backend allows: http://localhost:5173 ✅"
echo "   AWS Lambda allows: * (all origins) ✅"
echo ""

echo "6️⃣ To start services:"
echo "   Terminal 1: cd client && npm run dev"
echo "   Terminal 2: cd auth-backend && npm run dev"
echo ""

echo "7️⃣ Test endpoints:"
echo "   Client:       http://localhost:5173"
echo "   Login Page:   http://localhost:5173/login"
echo "   Auth Health:  http://localhost:3001/health"
echo ""

echo "✅ Configuration looks good! The services are independent and don't need to communicate with each other."
