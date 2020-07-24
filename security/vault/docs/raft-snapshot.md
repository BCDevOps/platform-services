# Backup with Raft Snapshot

The `vault` binary has integrated subcommands to manage the integrated Raft storage backend.

To run a backup, execute the following command:

```bash
vault operator raft snapshot save raft.snap
```

## Reference

[API docs for Raft storage](https://www.vaultproject.io/api-docs/system/storage/raft)