# Bootstrapping

After the deployment, Vault is not initialized yet.
This section describes first how to manually initialize Vault and then how to unseal Vault when
using Shamir keys (not Azure Key Vault). These sections are meant for educational
purposes and as a reference.
They don't reflect the production environment.

## Initializing Vault

Set the Kubernetes namespace for Vault as an environment variable for convenience and run the
following commands.

```bash
# new (desired) name used in silver
export NAMESPACE=openshift-bcgov-vault

# klab (old) for reference only
export NAMESPACE=devops-security-vault
```

Initialize Vault:

```bash
kubectl exec -ti vault-0 -n ${NAMESPACE} -- vault operator init -key-shares=5 -key-threshold=3
```

The output of the above command looks similar to this:

```bash
Unseal Key 1: x5+JLLgw8V3yGb9HWlElHtFXpcgijfR8t/d/cbD+qrE=
Unseal Key 2: ...
Unseal Key 3: ...
Unseal Key 4: ...
Unseal Key 5: ...

Initial Root Token: s.4DVvqIlgfoGsb9vQLZvGW05S
```

Now that Vault is initialized, we can continue with the unseal procedure in the next section.
When using Auto-Unseal, Vault is automatically unsealed through, for example, Azure Key Vault.

## Unsealing Vault

Unseal the first Vault pod until it reaches the key threshold:

```bash
kubectl exec -ti vault-0 -n ${NAMESPACE} -- vault operator unseal
kubectl exec -ti vault-0 -n ${NAMESPACE} -- vault operator unseal
kubectl exec -ti vault-0 -n ${NAMESPACE} -- vault operator unseal
```

This is an example output of `vault status` after successfully unsealing Vault:

```bash
$ vault status

Key                      Value
---                      -----
Recovery Seal Type       shamir
Initialized              true
Sealed                   false
Total Recovery Shares    5
Threshold                3
Version                  1.4.2
Cluster Name             vault-cluster-a06dedd4
Cluster ID               a88c09e4-fbfe-9ddd-e424-b1b46cb81254
HA Enabled               true
```

## Joining Pods to the Vault Cluster

The first unsealed Vault pod becomes the cluster leader within seconds. Once this occurred,
the remaining Vault pods can join the cluster as follows.

The commands below are to demonstrate the process.
Other Vault pods in the StatefulSet will automatically join the leader by specifying `retry_join` in the `vault.hcl` configuration file.

```bash
export NAMESPACE=devops-security-vault
export NAMESPACE=openshift-bcgov-vault

kubectl exec -ti vault-1 -n ${NAMESPACE} --  vault operator raft join -leader-ca-cert="$(cat ./tls/vault.ca)" --address "https://vault-1.vault-internal:8200" "https://vault-0.vault-internal:8200"

kubectl exec -ti vault-2 -n ${NAMESPACE} --  vault operator raft join -leader-ca-cert="$(cat ./tls/vault.ca)" --address "https://vault-2.vault-internal:8200" "https://vault-0.vault-internal:8200"
```

View the list of cluster peers to verify they joined successfully.

```bash
vault operator raft list-peers

# Example output below
{
 ...
  "data": {
    "config": {
      "index": 62,
      "servers": [
        {
          "address": "192.168.0.2:8201",
          "leader": true,
          "node_id": "node1",
          "protocol_version": "3",
          "voter": true
        },
        {
          "address": "192.168.0.4:8201",
          "leader": false,
          "node_id": "node3",
          "protocol_version": "3",
          "voter": true
        }
      ]
    }
  }
}
```
