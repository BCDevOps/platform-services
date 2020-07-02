# HashiCorp Vault Architecture and Design <!-- omit in toc -->

This documentation outlines the HashiCorp Vault Architecture and Design on OpenShift.

## Table of Contents <!-- omit in toc -->

### Vault Architecture and Design

- [Introduction and Architecture](./introduction.md)
- [Telemetry](./telemetry.md)
- [Troubleshooting](./troubleshooting.md)
- [TLS Cipher Suites](./vault-tls-cipher-suites.md)
- [Rotate and Rekey](./vault-rotate-and-rekey.md)
- [Create Raft Snapshot](./raft-snapshot.md)
- [Restore Raft Snapshot](./restore-snapshot.md)

### Use-Cases

- [Use-Case 1 Multi-Tenancy with Namespaces](./vault-use-case-1-multi-tenancy.md)

### Repository Folder Structure

- [Folder structure](#folder-structure)

## Folder structure

Below is a snapshot of this folder's structure.

```bash
.
├── ansible.cfg
├── docs
│   ├── README.md
│   ├── assets
│   │   ├── Monitoring\ Vault\ and\ Consul\ in\ Prod.pdf
│   │   ├── Vault-Consul-Monitoring-Guide.pdf
│   │   ├── disaster-recovery.pdf
│   │   └── vault-high-level-architecture-single-cluster.png
│   ├── introduction.md
│   ├── raft-snapshot.md
│   ├── restore-snapshot.md
│   ├── telemetry.md
│   ├── troubleshooting.md
│   ├── vault-rotate-and-rekey.md
│   └── vault-tls-cipher-suites.md
├── inventory
│   └── inventory
├── playbooks
│   └── vault_install.yml
└── roles
    └── vault_install
        ├── defaults
        │   └── main.yml
        ├── files
        │   └── values-minimal.yaml
        ├── tasks
        │   └── main.yml
        └── templates
```
