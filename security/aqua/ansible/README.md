# Aqua Playbook

### Requirements
- Python Modules
  - openshift 
  - jmespath

- CLI tools
  - oc
  - ansible >=2.8

- Aqua CSP License
- Aqua Registry Login Credentials

### Usage
This playbook can be used to install or uninstall Aqua on
an OpenShift Cluster

#### Quickstart


```
  export AQUA_ADMIN_PASSWORD=secure1234
  export AQUA_LICENSE=<giant license string>
  export AQUA_REG_USER=<aqua registry username (email)>
  export AQUA_REG_PASSWORD=<aqua registry password>
```
- Review/modify the inventory group vars as appropriate: 
  - For the Lab environment edit the [group_vars](group_vars/lab.yml)
  - For the Prod environment edit the [group_vars](group_vars/prod.yml)

- Ensure the system running this playbook is **already logged in to OpenShift** with appropriate credentials to OpenShift
    - The user running this playbook must have **cluster-admin** rights

- Run the playbook with the desired action
  - For installing all of the Aqua components in the `lab`: 
    ```
    ansible-playbook -i lab aqua.yml 
    ```
  - For removing **all Aqua components and pvc* from the `lab`:
    ```
    ansible-playbook -i lab aqua.yml -e aqua_state=absent
    ```


### Available Playbook Options
The Ansible playbook accepts a few options for performing maintenance: 
- **aqua_state=present (default)**
    - installs all components: 
        - aqua-database (Patroni)
        - aqua-console
        - aqua-gateway
        - aqua-scanner
        - aqua-agent (enforcers) - *WIP - Not Yet*


### Playbook Flow: Install
The ansible playbook flow is as follows for installation:

```
ansible-playbook -i lab aqua.yml
```

### Playbook Flow: Upgrade
The ansible playbook flow is as follows for installation:

```
ansible-playbook -i lab aqua.yml
```

### Playbook Flow: Uninstall

**Note: This WILL Delete the Namespace(s) if `aqua_manage_common_namespace: trye`**
```
ansible-playbook -i lab aqua.yml -e aqua_state=absent
```


## Todo
- [ ] Settings Restore Tasks / Playbook
- [ ] Aqua Agent Deployment
- [ ] Aqua Agent Remote Deployment
