# Ansible Role: vault_install

Runs a Vault cluster installation.

## Requirements

- `pip3 install openshift --user` (requires `>= 0.9.2`)
- `export KUBECONFIG=...` for the Ansible `k8s` module
- Requires an inventory file for the targeted OpenShift cluster, see section [Example inventory](#example-inventory).
- Requires a `group_vars/<group_name>.yml` file used by the above inventory file.

## Role Variables

Ansible role variables are listed below, along with default values (see `defaults/main.yml`).
Override them with the `group_vars/<group_name>.yml` file.

```yaml
vault_install_helm_repo_url: "https://helm.releases.hashicorp.com"
vault_install_chart_version: "0.8.0"
vault_install_chart_values: "values-minimal.yaml"
vault_install_ocp_namespace: "openshift-bcgov-vault"

vault_install_working_dir: "/tmp/vault_install/"
```

```yaml
vault_install_helm_repo_url: "https://helm.releases.hashicorp.com"
```

The helm repository URL.

```yaml
vault_install_chart_version: "0.8.0"
```

Helm Chart version.

```yaml
vault_install_chart_values: "values-minimal.yaml"
```

YAML file containing override values for the Helm Chart.

```yaml
vault_install_akv_client_id: "{{ lookup('env', 'AKV_CLIENT_ID') | default('') }}"
vault_install_akv_client_secret: "{{ lookup('env', 'AKV_CLIENT_SECRET') | default('') }}"
vault_install_akv_tenant_id: "{{ lookup('env', 'AKV_TENANT_ID') | default('') }}"
vault_install_akv_vault_name: "{{ lookup('env', 'AKV_VAULT_NAME') | default('') }}"
vault_install_akv_key_name: "{{ lookup('env', 'AKV_KEY_NAME') | default('') }}"
```

For Auto-Unseal with Azure Key Vault (AKV). The sensitive values are read in from exported environment variables on the Ansible controller.

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
- name: Install Vault cluster
  hosts: all
  gather_facts: false

  roles:
  - vault_install
```

Optionally, include a `-v` for more verbose output when running `ansible-playbook`. This ensures diagnostic
output is printed on standard out.

Execute the playbook without building the cluster:

```bash
ansible-playbook -i inventory/lab playbooks/vault_install.yml --skip-tags build -v
```

Execute the playbook for a full cluster build:

```bash
ansible-playbook -i inventory/lab playbooks/vault_install.yml -v
```
