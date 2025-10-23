#!/bin/bash

# Lighthouse Performance Test Script
# Tests performance, accessibility, best practices, and SEO

echo "🚀 Starting Lighthouse Performance Audit..."
echo "=========================================="
echo ""

# Check if lighthouse is installed
if ! command -v lighthouse &> /dev/null; then
    echo "⚠️  Lighthouse is not installed. Installing globally..."
    npm install -g lighthouse
fi

# Start the development server in the background
echo "📦 Starting Next.js dev server..."
cd "$(dirname "$0")/../apps/public"

# Kill any existing process on port 3002
lsof -ti:3002 | xargs kill -9 2>/dev/null || true

# Start dev server
pnpm dev &
DEV_PID=$!

# Wait for server to be ready
echo "⏳ Waiting for server to be ready..."
sleep 10

# Run Lighthouse tests
echo ""
echo "🔍 Running Lighthouse audit..."
echo ""

# Homepage audit
lighthouse http://localhost:3002 \
  --output html \
  --output json \
  --output-path ./lighthouse-reports/homepage \
  --chrome-flags="--headless --no-sandbox" \
  --only-categories=performance,accessibility,best-practices,seo \
  --quiet

# Detail page audit (if content exists)
lighthouse http://localhost:3002/iklan/welcome-to-our-masjid-a8b9c0d1-e2f3-4567-89ab-cdef01234567 \
  --output html \
  --output json \
  --output-path ./lighthouse-reports/detail-page \
  --chrome-flags="--headless --no-sandbox" \
  --only-categories=performance,accessibility,best-practices,seo \
  --quiet 2>/dev/null || echo "⚠️  Detail page test skipped (content may not exist)"

# Stop the dev server
kill $DEV_PID 2>/dev/null || true

echo ""
echo "✅ Lighthouse audit complete!"
echo ""
echo "📊 Results:"
echo "  - Homepage: ./lighthouse-reports/homepage.html"
echo "  - Detail page: ./lighthouse-reports/detail-page.html"
echo ""

# Parse JSON results and display scores
if [ -f "./lighthouse-reports/homepage.json" ]; then
    echo "🏠 Homepage Scores:"
    node -e "
    const fs = require('fs');
    const report = JSON.parse(fs.readFileSync('./lighthouse-reports/homepage.json', 'utf8'));
    const scores = report.categories;
    
    console.log('  Performance:    ' + Math.round(scores.performance.score * 100) + '/100');
    console.log('  Accessibility:  ' + Math.round(scores.accessibility.score * 100) + '/100');
    console.log('  Best Practices: ' + Math.round(scores['best-practices'].score * 100) + '/100');
    console.log('  SEO:            ' + Math.round(scores.seo.score * 100) + '/100');
    
    // Check if performance meets target
    const perfScore = Math.round(scores.performance.score * 100);
    if (perfScore >= 90) {
        console.log('\\n✅ Performance target achieved! (' + perfScore + '/100)');
    } else {
        console.log('\\n⚠️  Performance below target: ' + perfScore + '/100 (target: 90+)');
    }
    "
fi

echo ""
echo "Open the HTML reports in your browser for detailed analysis."
