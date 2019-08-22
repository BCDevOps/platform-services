# Requirements 

```
pip install openshift --user
pip install --upgrade requests --user
dnf install libselinux-python
```

# Usage

```
ansible-playbook  -i prod statuspage.yml  -e activity=uninstall -e env=prod
```