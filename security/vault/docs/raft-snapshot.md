# Backup with Raft Snapshot

The Consul Snapshot Agent takes regular backups of the underlying Consul
backend. The agent can run on multiple machines and will elect a leader
to take the snapshots of the backend. Running multiple agents on different
systems ensures backups are taken, even when individual systems fail.

Use the following file as a starting point to set up a systemd unit file
for the Consul Snapshot Agent.

This file can be found [here](files/consul-snapshot.service) for downloading.

```bash
[Unit]
Description="HashiCorp Consul Snapshot Agent"
Documentation=https://www.consul.io/
Requires=network-online.target
After=consul.service
ConditionFileNotEmpty=/etc/consul-snapshot.d/consul-snapshot.json

[Service]
Environment="CONSUL_HTTP_SSL=true"
User=consul
Group=consul
ExecStart=/usr/local/bin/consul snapshot agent -config-dir=/etc/consul-snapshot.d/
KillMode=process
Restart=on-failure
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
```

Here is an example configuration file for the Consul Snapshot Agent in
JSON-format. The example uses Azure Blob Storage as its backend. Many other
backends are allowed too.

This file can be found [here](files/consul-snapshot.json) for downloading.

```json
{
    "snapshot_agent": {
        "http_addr": "127.0.0.1:8443",
        "token": "${snapshot_token}",
        "datacenter": "consul-dc-name",
        "snapshot": {
            "interval": "30m",
            "retain": 336,
            "deregister_after": "8h"
        },
        "azure_blob_storage": {
            "account_name": "${blob_account_name}",
            "account_key": "${blob_account_key}",
            "container_name": "${blob_container_name}"
        }
    }
}
```
