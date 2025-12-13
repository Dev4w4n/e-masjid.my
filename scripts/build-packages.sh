#!/bin/bash

# Build script for Open E Masjid monorepo
# This script ensures packages are built in the correct dependency order

set -e

echo "🧹 Cleaning TypeScript build artifacts..."
find packages -name "*.tsbuildinfo" -delete 2>/dev/null || true
find apps -name "*.tsbuildinfo" -delete 2>/dev/null || true

echo "🔨 Building packages in dependency order..."

# Step 1: Build foundation packages (no dependencies)
echo "📦 Building foundation packages..."
pnpm tsc --build packages/shared-types packages/ui-theme

# Step 2: Build packages that depend on foundation packages
echo "📦 Building dependent packages..."
pnpm tsc --build packages/supabase-client packages/auth packages/ui-components

# Step 3: Run the full Turbo build to build apps and handle any remaining packages
echo "🚀 Running full build..."
pnpm build

echo "✅ Build completed successfully!"