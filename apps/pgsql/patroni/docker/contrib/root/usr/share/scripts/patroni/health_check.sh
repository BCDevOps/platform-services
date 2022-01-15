#!/usr/bin/env bash
set -Eeuo pipefail

# check for disk space. Fails if usage hits above 90%
df "${PATRONI_POSTGRESQL_DATA_DIR:-/home/postgres/pgdata}" --output=pcent | tail -n 1 | awk '{if ($1+0 > 90) exit 1; else exit 0;}'

pg_isready -q && curl -s localhost:8008/readiness | jq -e ". | select(.state == \"running\")"
