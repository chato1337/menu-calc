#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_FILE="${SCRIPT_DIR}/openapi.json"

cd "${SCRIPT_DIR}"

if command -v pipenv >/dev/null 2>&1; then
  pipenv run python manage.py spectacular --file "${OUTPUT_FILE}" --format openapi-json
else
  python manage.py spectacular --file "${OUTPUT_FILE}" --format openapi-json
fi

echo "OpenAPI schema exported to ${OUTPUT_FILE}"
