#!/bin/bash
set -euo pipefail

cd /usr/src/Jerky_web/Jerky_APP/Jerky

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo "Node.js 22 and npm must be installed on the server."
  exit 1
fi

if [ ! -f .env ]; then
  if ! command -v mysql >/dev/null 2>&1; then
    echo "MySQL client is not installed, so the first database could not be created."
    exit 1
  fi
  db_pass=$(openssl rand -hex 16)
  admin_pass=$(openssl rand -hex 16)
  mysql --protocol=socket -u root <<SQL
CREATE DATABASE IF NOT EXISTS jerky CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS jerky_shadow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'jerky'@'127.0.0.1' IDENTIFIED BY '${db_pass}';
CREATE USER IF NOT EXISTS 'jerky'@'localhost' IDENTIFIED BY '${db_pass}';
ALTER USER 'jerky'@'127.0.0.1' IDENTIFIED BY '${db_pass}';
ALTER USER 'jerky'@'localhost' IDENTIFIED BY '${db_pass}';
GRANT ALL PRIVILEGES ON jerky.* TO 'jerky'@'127.0.0.1';
GRANT ALL PRIVILEGES ON jerky.* TO 'jerky'@'localhost';
GRANT ALL PRIVILEGES ON jerky_shadow.* TO 'jerky'@'127.0.0.1';
GRANT ALL PRIVILEGES ON jerky_shadow.* TO 'jerky'@'localhost';
FLUSH PRIVILEGES;
SQL
  umask 077
  cat > .env <<EOF
DATABASE_URL="mysql://jerky:${db_pass}@127.0.0.1:3306/jerky"
SHADOW_DATABASE_URL="mysql://jerky:${db_pass}@127.0.0.1:3306/jerky_shadow"
DATABASE_HOST="127.0.0.1"
DATABASE_PORT="3306"
DATABASE_USER="jerky"
DATABASE_PASSWORD="${db_pass}"
DATABASE_NAME="jerky"
ADMIN_EMAIL="admin@jerky.tereshkovych.com.ua"
ADMIN_PASSWORD="${admin_pass}"
EOF
  unset db_pass admin_pass
  echo "Created /usr/src/Jerky_web/Jerky_APP/Jerky/.env and the MySQL database jerky. Passwords stay in that file."
fi

node deploy/ensure-database.mjs
npm ci
set +e
migrate_log=$(npx prisma migrate deploy --config prisma7.config.ts 2>&1)
migrate_status=$?
set -e
printf '%s\n' "$migrate_log"
if [ "$migrate_status" != "0" ]; then
  if printf '%s\n' "$migrate_log" | grep -q "20261105163851_order_prices_optional"; then
    npx prisma migrate resolve --rolled-back 20261105163851_order_prices_optional --config prisma7.config.ts
    npx prisma migrate deploy --config prisma7.config.ts
  else
    exit "$migrate_status"
  fi
fi
npx tsx deploy/ensure-admin.ts
npx tsx deploy/ensure-catalog.ts
npm run build

echo "=== listening sockets ==="
ss -ltnp || true
echo "=== nginx sites ==="
if command -v nginx >/dev/null 2>&1; then
  nginx -T 2>/dev/null | grep -E 'server_name|listen |proxy_pass' || true
fi

listener_pid() {
  ss -ltnp "sport = :$1" 2>/dev/null | sed -n 's/.*pid=\([0-9][0-9]*\).*/\1/p' | head -1
}

is_jerky_pid() {
  local pid="$1"
  local cmd cwd
  cmd=$(tr '\0' ' ' < "/proc/${pid}/cmdline" 2>/dev/null || true)
  cwd=$(readlink "/proc/${pid}/cwd" 2>/dev/null || true)
  case "${cwd}${cmd}" in
    */usr/src/Jerky_web/Jerky_APP/Jerky*) return 0 ;;
    *) return 1 ;;
  esac
}

port=""
if [ -f .deploy-port ]; then
  saved=$(tr -cd '0-9' < .deploy-port)
  if [ -n "$saved" ]; then
    pid=$(listener_pid "$saved")
    if [ -z "$pid" ] || is_jerky_pid "$pid"; then
      port="$saved"
    else
      echo "Port ${saved} belongs to another site. It will not be stopped."
    fi
  fi
fi
if [ -z "$port" ]; then
  for candidate in $(seq 3030 3099); do
    if [ -z "$(listener_pid "$candidate")" ]; then
      port="$candidate"
      break
    fi
  done
fi
if [ -z "$port" ]; then
  echo "No free port from 3030 to 3099."
  exit 1
fi
echo "Jerky will use 127.0.0.1:${port}"
printf '%s\n' "$port" > .deploy-port

systemctl stop jerky || true
pid=$(listener_pid "$port")
if [ -n "$pid" ]; then
  if is_jerky_pid "$pid"; then
    echo "Stopping the previous Jerky process ${pid} on port ${port}."
    kill "$pid" || true
    sleep 1
  else
    echo "Port ${port} is busy with another site. Not stopping it."
    exit 1
  fi
fi

sed "s/__PORT__/${port}/g" deploy/jerky.service > /etc/systemd/system/jerky.service
systemctl daemon-reload
systemctl enable jerky
systemctl restart jerky

if command -v nginx >/dev/null 2>&1; then
  site=/etc/nginx/sites-available/jerky.conf
  if [ ! -d /etc/nginx/sites-available ] && [ -d /etc/nginx/conf.d ]; then
    site=/etc/nginx/conf.d/jerky.conf
  fi
  cert=/etc/letsencrypt/live/jerky.tereshkovych.com.ua/fullchain.pem
  if [ -f "$site" ] && [ -f "$cert" ] && grep -q "ssl_certificate" "$site"; then
    sed -i "s|proxy_pass http://127.0.0.1:[0-9][0-9]*;|proxy_pass http://127.0.0.1:${port};|" "$site"
  else
    if [ -d /etc/nginx/sites-available ]; then
      sed "s/__PORT__/${port}/g" deploy/nginx-jerky.conf > /etc/nginx/sites-available/jerky.conf
      ln -sfn /etc/nginx/sites-available/jerky.conf /etc/nginx/sites-enabled/jerky.conf
    elif [ -d /etc/nginx/conf.d ]; then
      sed "s/__PORT__/${port}/g" deploy/nginx-jerky.conf > /etc/nginx/conf.d/jerky.conf
    fi
    nginx -t
    systemctl reload nginx
    if [ -f "$cert" ]; then
      certbot install --nginx --cert-name jerky.tereshkovych.com.ua --redirect --non-interactive
    else
      certbot --nginx -d jerky.tereshkovych.com.ua --non-interactive --agree-tos --redirect
    fi
  fi
  nginx -t
  systemctl reload nginx
else
  echo "nginx is not installed. The app is listening on 127.0.0.1:${port} only."
  exit 1
fi

ok=0
for _ in $(seq 1 30); do
  if curl -fsS --max-time 5 "http://127.0.0.1:${port}/pl" >/dev/null; then
    ok=1
    break
  fi
  sleep 1
done

if [ "$ok" != "1" ]; then
  echo "Jerky did not answer on 127.0.0.1:${port}."
  systemctl status jerky --no-pager || true
  journalctl -u jerky -n 80 --no-pager || true
  exit 1
fi

echo "Jerky is serving http://127.0.0.1:${port}/pl"
