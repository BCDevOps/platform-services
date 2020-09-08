# Backup with Raft Snapshot

## Automated Solution

In a production environment, a backup should run on a clear schedule.
The time between backups depends on the Recovery Point Objective (RPO).
As Vault is typically read-heavy while secrets are less often added or changed,
an hourly schedule is sufficient.

Every full hour, i.e., at 6:00, 7:00, 8:00, ..., a full backup is written to the
NFS storage endpoint, which is backed by NetApp.
Each backup's filename includes a date timestamp of the form **YYYY-MM-DD_HH-MM**.
The table below provides a quick overview.

| **Source**          | Vault Integrated Storage via Vault API call |
| **Destination**     | NFS Storage Class (backed by NetApp)        |
| **Frequency**       | Hourly, i.e., at 6:00, 7:00, 8:00, ...      |
| **Filename Format** | YYYY-MM-DD_HH-MM.snap                       |

A Kubernetes CronJob is defined to backup Vault every hour to the NFS storage endpoint.
This CronJob uses Vault's Kubernetes Authentication Method via sidecar injection.

## Manual Option

The `vault` binary has subcommands to manage the integrated Raft storage backend.

To run a backup manually, execute the following command:

```bash
vault operator raft snapshot save raft.snap
```

## Reference

[API docs for Raft storage](https://www.vaultproject.io/api-docs/system/storage/raft)
