# Ansible Role: vault_generate_terraform_files

When a request for a new OpenShift project came in, within the project provisioning workflow,
Ansible will template out the required terraform files.
See [TODO section](#todo) at the end.

## Requirements

- Ansible needs the licensePlate as a variable, which will be used to template out the terraform files

## Role Variables

Ansible role variables are listed below, along with default values (see `defaults/main.yml`).

```yaml
# The application licensePlate
vault_generate_terraform_files_lp: ""
```

## Dependencies

- None
<!-- - pip module `openshift >= 0.9.2` -->

## Example Inventory

```ini
[lab]
localhost ansible_connection=local
```

## Example Playbook

```yaml
---
- name: Generate terraform files for new project in Vault
  hosts: all
  gather_facts: false

  roles:
  - vault_generate_terraform_files
```

Always include a `-v` for more verbose output when running `ansible-playbook`. This ensures diagnostic
output is printed on standard out.

Execute the playbook:

```bash
ansible-playbook -i inventory/lab playbooks/vault_generate_terraform_files.yml -v
```

## TODO

