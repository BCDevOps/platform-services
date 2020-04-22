#!/bin/bash

if [ -z "$BASIC_AUTH_PASSWORD" ]; then
  echo "Must enter password. Environment variable is BASIC_AUTH_PASSWORD"
  exit 1
fi

if [ -z "$BASIC_AUTH_USERNAME" ]; then
  echo "Must enter username. Environment variable is BASIC_AUTH_USERNAME"
  exit 1
fi

if [ -z "$CADDY_CONFIGMAP" ]; then
  echo "Must enter caddy configmap name. Environment variable is CADDY_CONFIGMAP"
  exit 1
fi

function baseDirectives {
  cat << EOF
  :2015

  root * /var/www/html

  file_server

  encode gzip
  log stdout
  log stderr
EOF
}

# usage is basicAuthDirective username hashedpassword
function basicAuthDirective {
  cat << EOF
  basicauth * {
	  $1 $2
  }
EOF
}
configmap=$(/usr/bin/oc get configmap/$CADDY_CONFIGMAP)

if [ $configmap="No Resources Found." ]; then
  echo "Config map at $configmap was not found"
  exit 1
fi

hashedPw=$(caddy hash-password -plaintext $BASIC_AUTH_PASSWORD)

caddyfile=$(mktemp)

baseDirectives >> caddyfile
basicAuthDirective $BASIC_AUTH_USERNAME $hashedPw >> caddyfile

echo "caddyfile created"

cat $caddyfile

tools/audit/repo-mapper/passwordUpdate