# Ansible for HashiCorp Vault Deployment

The Ansible playbooks and roles in this folder structure assume that the OpenShift namespace, e.g.,
`openshift-bcgov-vault` (old: `devops-security-vault`) already exists in the cluster.

## Requirements

* `consul` open-source binary

Download the open-source `consul` binary.
This is the easiest way to generate a self-signed CA and certificates.

## Installation

Run the playbook `vault_install_new.yml`.

## Post-Installation

Run these playbooks in the following order:

1. `00-post_install_audit_and_license.yml`
2. `01-post_install_prepare_for_terraform.yml`
3. `02-post_install_enable_kubernetes_auth.yml`
4. `03-post_install_backup_install.yml`
