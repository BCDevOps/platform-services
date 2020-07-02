# Telemetry

This section explains selected metrics that are relevant to Vault and Consul.

## References

For further information please go through the following resources:

- [HashiCorp - Production Monitoring of Vault and Consul](./assets/pdfs/Monitoring%20Vault%20and%20Consul%20in%20Prod.pdf)
- [Vault/Consul Monitoring Guide](./assets/pdfs/Vault-Consul-Monitoring-Guide.pdf)

## Operating System Metrics

The following metrics should be tracked as a matter of course on a Linux machine, and may give insight into the performance of Vault and Consul.

- Memory Usage
  - memory usage should be constant once system is in a steady state and should not grow or spike
  - an abnormal increase in memory usage could signify a memory leak or too many concurrent processes
  - Log into the system and use tools like `top`, `ps waux` and `free -m` to determine memory usage patterns and determine which processes to investigate further
- CPU Utilization
  - a spike in CPU usage may indicate too many operations taking place at once
  - a CPU iowait time greater than 10% means Consul is waiting for data to be written, which could be a sign that Raft is writing snapshots to the disk too often.
  - Log into the system and use tools like `top` and `ps waux` to determine CPU usage patterns and determine which processes to investigate further
- Network Utilization
  - sudden spikes (more than 50% deviation from mean) in network bytes sent or received may be due to a misconfigured client or larger loads that were planned for.
  - Log into the system and use `netstat` to list open connections, `vmstat` to show I/O load
- File Descriptor Usage
  - The number of file handles in use increases with process and network load.  If this reaches 80% of its maximum, an alert should be generated and the cause should be investigated.
  - Log into the system and use `lsof` to list open file handles and their processes

## Important Vault and Consul metrics

Vault and Consul provide a number of metrics to measure their performance and statistics.

The following reference documents describe every metric that is available to monitor for Vault and Consul:

- Vault - ​https://www.vaultproject.io/docs/internals/telemetry.html
- Consul - ​https://www.consul.io/docs/agent/telemetry.html

Below is a list of some of the key important metrics provided by Vault and Consul, and for each metric, why it's important, what to look for and alert on, and what to investigate.  Often, the contributing factors to consider when identifying the cause of a problem can be wide ranging, so specific troubleshooting steps may be hard to predict. General troubleshooting strategies such as investigating operating system indicators and consulting log output for notifications and patterns will provide the best opportunities to understand unwanted system behaviour.

A fuller explanation of Vault and Consul monitoring is covered here: https://s3-us-west-2.amazonaws.com/hashicorp-education/whitepapers/Vault/Vault-Consul-Monitoring-Guide.pdf

Metrics are of the following data types:

- `[C]`ounter
  - a number that only increases or is reset to zero
  - your reporting system should be able to measure delta over time for these values
  - useful to observe long term trends
- `[G]`auge
  - a single number that can go up or down
  - useful to build charts
- `[S]`ummary
  - a number of observations about a single value
  - includes a LastUpdated field to evaluate trends
  - observation fields can include [not a complete list]:
    - `Sum`
    - `Count`
    - `Mean`
    - `Avg`
    - `Min`
    - `Max`
    - `StdDev`
    - `90_percentile`
    - `Upper`
    - `Lower`

## Vault request handling

This metric shows the time in milliseconds taken by vault to handle requests.  It is the key measure of Vault's response time.

- `vault.core.handle_request [S]`
  - count and duration (ms) of vault's handling of requests

As a summary, you will be able to see `mean` and `stddev` metrics for this value.
Look for changes to the count or mean fields that exceed 50% of baseline values, or more than 3 standard deviations above baseline.

**Investigate:** Over time with the continued adoption of Vault in the
company, the number of handled requests by Vault will increase.
If the duration in milliseconds increases dramatically, take CPU and memory
utilization into account as well. If either, CPU or memory, utilization is high,
it might be time to spread the load across more Vault nodes or upgrade the
public cloud machine type of the Vault VMs.

## Vault metrics regarding Consul response time

These metrics show how long it takes for Consul to handle requests sent from Vault for different operations.

- `vault.consul.{get|put|list|delete} [S]`
  - count and duration (ms) of consul read and write operations

Look for large deltas in the `count`, `upper`, or `90_percentile` fields.

**Investigate:** Fluctuations in these numbers can indicate troubles with configuration or load on the network or on Consul nodes.

## Vault Write-Ahead Logs (WALs)

WALs are used to replicate Vault between clusters. They exist even in non-replicated clusters but are purged by the garbage collector every few seconds. If Vault is under heavy load the WAL may grow, which will increase demands on Consul.

- `vault.wal_persistwals [S]`
  - time (ms) taken to persist a WAL
- `vault.wal_flushready [S]`
  - time (ms) to flush a WAL to storage

Look for `wal_flushready` over 500ms or `wal_persistwals` over 1000ms.

**Investigate:** This indicates that there may be slowness in the storage backend or in the network between Vault and Consul.
Check if there are any current known performance impacts on that zone
or region of your public cloud provider.
High CPU utilization can also lead to higher values.

## Leadership Metrics

A cluster should have a stable leader and not be subject to frequent elections or leadership changes.  If this happens, it could indicate problems with the servers communicating with each other or that there is heavy load that they cannot manage.

Both Vault and Consul report their leadership metrics.

- `{vault|consul}.raft.leader.lastContact [S]`
  - time (ms) since the leader was able to contact the follower nodes
- `{vault|consul}.raft.state.candidate [C]`
  - increments whenever raft server starts an election
- `{vault|consul}.raft.state.leader [C]`
  - increments whenever raft server becomes a leader

In a healthy cluster, `lastContact` should be lower than 200ms, `leader` should be greater than 0 and stable and `candidate` should be 0.  If this is not the case, it could indicate rapid changes in leadership.

**Investigate:** Investigate network and application load.
SSH login to the affected VM. Analyze the log messages
for type WARN, ERROR, and DEBUG indicating why leadership is changing.

```bash
sudo journalctl -xe -u vault
sudo journalctl -xe -u consul
```

## Consul Cluster Health

- `consul.autopilot.healthy [G]`
  - this value will be set to 1 for normal operation

Look for a value of 0 indicating at least one unhealthy server in the cluster.

**Investigate:** SSH login to the affected VM. Analyze the log messages
for type WARN, ERROR, and DEBUG indicating why this node is unhealthy.

```bash
sudo journalctl -xe -u consul
```

## Garbage Collection

Garbage Collection is a "stop the world" event that blocks all threads until it completes.  Under normal circumstances, the pause is only a few nanoseconds.  If memory usage is high, however, the Go language runtime may GC so much that it slows down the service.

- `{vault|consul}.runtime.total_gc_pause_ns [C]`
  - total Garbage Collector pause (ns) since service was started 

Look for and alert on `total_gc_pause_ns` over 2 seconds per minute.

**Investigate:** Investigate cpu and memory usage and application load.
