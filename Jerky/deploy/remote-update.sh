#!/bin/bash
set -euo pipefail

cd /usr/src/jerky

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo "Node.js 22 and npm must be installed on the server."
  exit 1
fi

if [ ! -f .env ]; then
  echo "Create /usr/src/jerky/.env before the first deploy. Deploys do not write it."
  echo "Use the same names as Jerky/.env.example, with the server MySQL account and a new admin password."
  exit 1
fi

npm ci
npx prisma migrate deploy --config prisma7.config.ts
npm run build

install -m 644 deploy/jerky.service /etc/systemd/system/jerky.service
systemctl daemon-reload
systemctl enable jerky
systemctl restart jerky

if command -v nginx >/dev/null 2>&1; then
  if [ -d /etc/nginx/sites-available ]; then
    install -m 644 deploy/nginx-jerky.conf /etc/nginx/sites-available/jerky.conf
    ln -sfn /etc/nginx/sites-available/jerky.conf /etc/nginx/sites-enabled/jerky.conf
  elif [ -d /etc/nginx/conf.d ]; then
    install -m 644 deploy/nginx-jerky.conf /etc/nginx/conf.d/jerky.conf
  fi
  nginx -t
  systemctl reload nginx
else
  echo "nginx is not installed. The app is listening on 127.0.0.1:3010 only."
  exit 1
fi

ok=0
for _ in $(seq 1 30); do
  if curl -fsS --max-time 5 http://127.0.0.1:3010/pl >/dev/null; then
    ok=1
    break
  fi
  sleep 1
done

if [ "$ok" != "1" ]; then
  echo "Jerky did not answer on 127.0.0.1:3010."
  systemctl status jerky --no-pager || true
  journalctl -u jerky -n 80 --no-pager || true
  exit 1
fi

echo "Jerky is serving http://127.0.0.1:3010/pl"
