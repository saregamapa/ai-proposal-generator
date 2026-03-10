#!/usr/bin/env bash
set -euo pipefail
echo 'AI Proposal Generator Bootstrap'
command -v node >/dev/null 2>&1 || { echo 'Node.js required'; exit 1; }
if [ ! -f '.env' ]; then cp .env.example .env; echo 'Created .env'; fi
cd backend && npm ci --prefer-offline && npx prisma generate && cd ..
cd frontend && npm ci --prefer-offline && cd ..
echo 'Setup complete! Edit .env with your API keys then run: cd backend && npm run dev'
