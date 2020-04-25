# Requirements 

```
pip install openshift --user
pip install --upgrade requests --user
dnf install libselinux-python
```

Note: the grafana-dashboard binary (from grafyaml) requires python 2. This is configured in `group_vars`. 

# Usage

This playbook supports deployment into multiple namespace enviornments, and also supports the following activities: 
- uninstall
- install
- configure

```
ansible-playbook  -i prod statuspage.yml  -e activity=uninstall -e env=prod
```