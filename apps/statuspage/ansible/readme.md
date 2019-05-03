# Requirements 

```
pip install openshift --user
pip install --upgrade requests --user
```

# Usage

```
 ansible-playbook  -i prod statuspage.yml  -e activity=uninstall -e env=prod
 ```