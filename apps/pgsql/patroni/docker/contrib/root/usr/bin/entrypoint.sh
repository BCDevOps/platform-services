#!/bin/bash

if [[ $UID -ge 10000 ]]; then
    GID=$(id -g)
    sed -e "s/^postgres:x:[^:]*:[^:]*:/postgres:x:$UID:$GID:/" /etc/passwd > /tmp/passwd
    cat /tmp/passwd > /etc/passwd
    rm /tmp/passwd
fi

# FIX -> FATAL:  data directory "..." has group or world access
mkdir -p "$PATRONI_POSTGRESQL_DATA_DIR"
chmod 700 "$PATRONI_POSTGRESQL_DATA_DIR"

SUBBED_CONFIG=$(eval echo $PATRONI_CONFIG)

cat > /home/postgres/patroni.yml <<__EOF__
${SUBBED_CONFIG}
__EOF__

unset PATRONI_SUPERUSER_PASSWORD PATRONI_REPLICATION_PASSWORD SUBBED_CONFIG
export KUBERNETES_NAMESPACE=$PATRONI_KUBERNETES_NAMESPACE
export POD_NAME=$PATRONI_NAME

exec /usr/bin/python3 /usr/local/bin/patroni /home/postgres/patroni.yml
