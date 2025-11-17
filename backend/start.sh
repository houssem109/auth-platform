#!/bin/sh

echo "🚀 Running Prisma Generate..."
npx prisma generate

echo "🚀 Running Prisma Migrate Deploy..."
npx prisma migrate deploy

echo "🚀 Running Prisma Seed..."
npx prisma db seed

echo "🚀 Starting Backend Server..."
node dist/src/index.js
