#!/bin/bash

echo "Testing..."

for ((i = 1; i <= $1; i++ )); do 
    sleep 1
    curl -w "@curl-format.txt" -o /dev/null -s "$FRONTEND_ADDR" >>$(hostname).dat
done
