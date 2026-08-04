#!/usr/bin/env bash
# /var/www/starspaymee/deploy.sh — zero-downtime deploy
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/starspaymee}"
cd "$APP_DIR"

# .env ni shu skriptga ham yuklaymiz (CF_ZONE_ID, CF_API_TOKEN kerak)
set -a
[ -f .env ] && . ./.env
set +a

say() { printf '\n\033[1;36m▸ %s\033[0m\n' "$1"; }

say 'Kod tortilmoqda'
git pull --ff-only origin main

say 'Paketlar'
# Build uchun devDependencies KERAK (typescript, prisma CLI, tsx).
# `--omit=dev` qilsak `next build` yiqiladi.
npm ci

say 'Migratsiya'
npx prisma migrate deploy
npx prisma generate

say 'Build (landing statik bo‘lishi kerak)'
npm run build

# Ikkala sahifa ham statik render bo'lganini tekshiramiz — cho'qqi trafikda eng
# muhim shart. Statik sahifa uchun Next tayyor HTML yozadi; dinamik bo'lsa yo'q.
#   index.html — darvoza (`/`),  l.html — landing (`/l`)
for page in 'index:/ (darvoza)' 'l:/l (landing)'; do
  file=".next/server/app/${page%%:*}.html"
  if [ ! -f "$file" ]; then
    echo "‼ TO‘XTA: $file yo‘q — ${page#*:} statik render bo‘lmagan."
    echo '  Sabab: `cookies()`, `headers()` yoki `searchParams` sahifa zanjirida.'
    echo '  Bu holda har so‘rov render‘ga tushadi va cho‘qqida server yiqiladi.'
    exit 1
  fi
  echo "  ✓ ${page#*:} statik (SSG)"
done

say 'Worker kompilyatsiyasi'
npm run build:worker

say 'PM2 reload (zero-downtime)'
pm2 reload sp-web --update-env
pm2 restart sp-worker --update-env

say 'Sog‘liq tekshiruvi'
for i in $(seq 1 20); do
  if curl -fsS -m 2 http://127.0.0.1:3000/api/health >/dev/null; then
    echo "  ok ($i)"
    break
  fi
  [ "$i" = 20 ] && { echo '‼ /api/health javob bermadi — pm2 logs sp-web'; exit 1; }
  sleep 1
done

if [ -n "${CF_ZONE_ID:-}" ] && [ -n "${CF_API_TOKEN:-}" ]; then
  say 'Cloudflare cache tozalash'
  curl -fsS -X POST "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/purge_cache" \
    -H "Authorization: Bearer $CF_API_TOKEN" \
    -H 'Content-Type: application/json' \
    --data '{"purge_everything":true}' >/dev/null && echo '  tozalandi'
else
  echo '• CF_ZONE_ID/CF_API_TOKEN yo‘q — Cloudflare cache tozalanmadi'
fi

say 'Deploy tugadi'
pm2 list
