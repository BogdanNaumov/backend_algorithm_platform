#!/bin/sh
set -e

# Том node_modules может быть создан до обновления package.json — подтягиваем зависимости.
npm install

exec npm run dev -- --host 0.0.0.0 --port 5173
