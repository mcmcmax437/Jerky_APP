#!/bin/bash
set -euo pipefail

cd /usr/src/jerky

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo "Node.js 22 and npm must be installed on the server."
  exit 1
fi

fresh_env=0
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
  fresh_env=1
  echo "Created /usr/src/jerky/.env and the MySQL database jerky. Passwords stay in that file."
fi

npm ci
npx prisma migrate deploy --config prisma7.config.ts
if [ "$fresh_env" = "1" ]; then
  npx tsx prisma/seed.ts
fi
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
