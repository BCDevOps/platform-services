#!/bin/bash

if ! whoami &> /dev/null; then
  if [ -w /etc/passwd ]; then
    echo "${USER_NAME:-default}:x:$(id -u):0:${USER_NAME:-default} user:${HOME}:/sbin/nologin" >> /etc/passwd
  fi
fi

# Set Env variables from configMap data
export TOKEN=$(cat /opt/creds/token)

/opt/webhook -hooks /opt/hooks/hooks.yml -verbose