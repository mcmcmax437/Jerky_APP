import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

function readEnv(path) {
  const values = new Map();
  for (const line of readFileSync(path, "utf8").split(/\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const split = trimmed.indexOf("=");
    if (split < 0) continue;
    const key = trimmed.slice(0, split).trim();
    let value = trimmed.slice(split + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    values.set(key, value);
  }
  return values;
}

function passwordFromUrl(url) {
  try {
    return decodeURIComponent(new URL(url).password);
  } catch {
    return "";
  }
}

function quote(value) {
  return value.replaceAll("\\", "\\\\").replaceAll("'", "''");
}

const env = readEnv(".env");
const user = env.get("DATABASE_USER") || "jerky";
const database = env.get("DATABASE_NAME") || "jerky";
const password = env.get("DATABASE_PASSWORD") || passwordFromUrl(env.get("DATABASE_URL") ?? "");

if (!/^[A-Za-z0-9_]+$/.test(user) || !/^[A-Za-z0-9_]+$/.test(database)) {
  console.error("DATABASE_USER and DATABASE_NAME must contain only letters, numbers, and underscores.");
  process.exit(1);
}
if (!password) {
  console.error("DATABASE_PASSWORD is missing from .env.");
  process.exit(1);
}

const account = `'${quote(user)}'`;
const secret = `'${quote(password)}'`;
const sql = `
CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS \`${database}_shadow\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS ${account}@'127.0.0.1' IDENTIFIED BY ${secret};
CREATE USER IF NOT EXISTS ${account}@'localhost' IDENTIFIED BY ${secret};
ALTER USER ${account}@'127.0.0.1' IDENTIFIED BY ${secret};
ALTER USER ${account}@'localhost' IDENTIFIED BY ${secret};
GRANT ALL PRIVILEGES ON \`${database}\`.* TO ${account}@'127.0.0.1';
GRANT ALL PRIVILEGES ON \`${database}\`.* TO ${account}@'localhost';
GRANT ALL PRIVILEGES ON \`${database}_shadow\`.* TO ${account}@'127.0.0.1';
GRANT ALL PRIVILEGES ON \`${database}_shadow\`.* TO ${account}@'localhost';
FLUSH PRIVILEGES;
`;

const result = spawnSync("mysql", ["--protocol=socket", "-u", "root"], { input: sql, encoding: "utf8" });
if (result.status !== 0) {
  const detail = `${result.stderr ?? ""}${result.stdout ?? ""}`.replaceAll(password, "***");
  console.error(detail.trim() || "MySQL root could not update the application user through the local socket.");
  process.exit(result.status ?? 1);
}

console.log(`MySQL user ${user} now matches the password in .env.`);
