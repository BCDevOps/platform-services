# Consul snapshot restore

**Warning:** Restores involve a potentially dangerous low-level Raft operation that is not designed to handle server failures during a restore. This command is primarily intended to be used when recovering from a disaster, restoring into a fresh cluster of Consul servers.
 

Running the restore process should be straightforward. However, there are a couple of actions you can take to ensure the process goes smoothly. First, make sure the datacenter you are restoring is stable and has a leader. You can see this using consul operator raft list-peers and checking server logs and telemetry for signs of leader elections or network issues.

Also, shutdown all Vault nodes writing to that Consul cluster to avoid any operations on Consul while running the restore.

You will only need to run the process once, on the leader. The Raft consensus protocol ensures that all servers restore the same state.

```bash
$ vault operator raft snapshot restore backup.snap
Restored snapshot
```

The above command creates a syslog entry on the Consul leader node similar to the following:

```bash
May 14 14:08:00 vm consul[21094]:     2020/05/14 14:08:00 [INFO]  raft: Restored user snapshot (index 813590)
```

## Brent's notes

from https://www.consul.io/api/snapshot.html#restore-snapshot

### Restore Snapshot
This endpoint restores a point-in-time snapshot of the Consul server state.

Restores involve a potentially dangerous low-level Raft operation that is not designed to handle server failures during a restore. This operation is primarily intended to be used when recovering from a disaster, restoring into a fresh cluster of Consul servers.

The body of the request should be a snapshot archive returned from a previous call to the GET method.

|Method | Path      | Produces |
| ------|:----------|:----------|
|PUT    | /snapshot | 200 text/plain (empty body) |
