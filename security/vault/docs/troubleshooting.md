# Troubleshooting

Here are some steps to take when you encounter errors.

## Check the status of Vault/Consul system in the cluster

- Consul: All cluster members should be in either a leader (1) or follower (4) state. Five (5) Consul systems total in the Consul cluster
- Vault: Should be unsealed and performance standby if not the active leader system

```bash
# for Consul: show cluster members and their state: leader/follower
consul operator raft list-peers
# Run on each Vault: show status of the local Vault system
vault status
```

## Analyze log messages

- Use the central logging solution to analyze log messages from the erroneous Vault/Consul system
- Alternatively, SSH into the erroneous Vault/Consul system and analyze
log messages for any warning or error messages

```bash
# Commands to view log messages, filter with grep as needed
sudo journalctl -xe -u vault
sudo journalctl -xe -u consul
```

## Increase log-level

When the log messages do not reveal any or more information about the
observed behavior, consider increasing the log-level for Vault.

If you define the log-level via the systemd unit-file, then change the
log-level as follows.

```bash
ExecStart=/opt/vault/1.4.2/vault server -config=/etc/vault/vault.json -log-level=debug
```

If you don't set the log-level via the systemd unit-file, then add the
following lines to the Vault configuration to set the log-level
to debug.

```bash
# for JSON format
"log_level": "debug"
# for HCL format
log_level = "debug"
```

Once the log-level has been increased to debug use the steps from
section *Analyze log messages*.

## Support ticket

Open a support ticket by visiting
[https://support.hashicorp.com/hc/en-us](https://support.hashicorp.com/hc/en-us)

If the error is reproducible, the support may ask to attach a debug file.
Generate this only if asked by the support.

To generate a debug archive, use the following command. Adjust the
*interval* and *duration* as needed.

```bash
vault debug -interval=1m -duration=10m
```
