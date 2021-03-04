# Ansible Role: vault_prepare_for_terraform

Set up Vault with AppRole and appropriate policies.

## Requirements

- `pip3 install openshift --user` (requires `>= 0.9.2`)
- `export KUBECONFIG=...` for the Ansible `k8s` module
- Requires an inventory file for the targeted OpenShift cluster, see section [Example inventory](#example-inventory). 
- Requires a `group_vars/<group_name>.yml` file used by the above inventory file.

## Role Variables

Ansible role variables are listed below, along with default values (see `defaults/main.yml`).

```yaml
# Vault AppRole Role name used by Terraform
vault_prepare_for_terraform_approle_role_name: "terraform"

# Vault policies attached to the AppRole used by Terraform
vault_prepare_for_terraform_approle_policies: "default,policyadmin,namespaceadmin"

# Vault AppRole SecretID number of uses (0 means infinite)
vault_prepare_for_terraform_approle_sid_uses: "3"

# Vault Token TTL for the AppRole issued Vault Token
vault_prepare_for_terraform_token_ttl: "5m" # 5m

# Vault Token MaxTTL for the AppRole issued Vault Token
vault_prepare_for_terraform_token_max_ttl: "10m" # 10m

# Certificate verification toggle
vault_prepare_for_terraform_verify: False

# Vault Namespace to create
vault_prepare_for_terraform_ns1: "platform-services"
```

## Dependencies

- pip module `openshift >= 0.9.2`

## Example Inventory

```ini
[lab]
localhost ansible_connection=local
```

## Example Playbook

```yaml
---
- name: Prepare Vault for future configuration via Terraform with AppRole
  hosts: all
  gather_facts: True # required for assert module to check shell environment variables

  roles:
  - vault_prepare_for_terraform
```

Always include a `-v` for more verbose output when running `ansible-playbook`. This ensures diagnostic
output is printed on standard out.

Execute the playbook:

```bash
ansible-playbook -i inventory/lab playbooks/01-post_install_prepare_for_terraform.yml -v
```
