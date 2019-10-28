#!/bin/sh
export DOCUMIZEDB="host=$DB_HOST port=$DB_PORT sslmode=disable user=$DB_USERNAME password=$DB_PASSWORD dbname=$DB_NAME"
documize
