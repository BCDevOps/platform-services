# Ansible Role: vault_enable_kubernetes_auth

Configures the Vault Kubernetes Authentication Method.
This requires information about the Kubernetes/OpenShift cluster.

## Requirements

- `oc` CLI set up to query the cluster where Vault is installed
- `pip3 install openshift --user` (requires `>= 0.9.2`)
- `export KUBECONFIG=...` for the Ansible `k8s` module
- Requires an inventory file for the targeted OpenShift cluster, see section [Example inventory](#example-inventory). 
- Requires a `group_vars/<group_name>.yml` file used by the above inventory file.

## Role Variables

Ansible role variables are listed below, along with default values (see `defaults/main.yml`).

```yaml
vault_enable_kubernetes_auth_helm_repo_url: "https://helm.releases.hashicorp.com"
vault_enable_kubernetes_auth_chart_version: "0.8.0"
vault_enable_kubernetes_auth_chart_values: "values-minimal.yaml"
vault_enable_kubernetes_auth_ocp_namespace: "openshift-bcgov-vault"

vault_enable_kubernetes_auth_working_dir: "/tmp/vault_enable_kubernetes_auth/"
```

```yaml
vault_enable_kubernetes_auth_helm_repo_url: "https://helm.releases.hashicorp.com"
```

The helm repository URL.

```yaml
vault_enable_kubernetes_auth_chart_version: "0.8.0"
```

Helm Chart version.

```yaml
vault_enable_kubernetes_auth_chart_values: "values-minimal.yaml"
```

YAML file containing override values for the Helm Chart.

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
- name: Enable Vault Kubernetes Auth 
  hosts: all
  gather_facts: true
  environment:
    PATH: "{{ ansible_env.PATH }}:{{ lookup('env','HOME') }}/bin"

  roles:
  - vault_enable_kubernetes_auth
```

Always include a `-v` for more verbose output when running `ansible-playbook`. This ensures diagnostic
output is printed on standard out.

Execute the playbook:

```bash
ansible-playbook -i inventory/lab playbooks/02-post_install_enable_kubernetes_auth.yml -v
```
