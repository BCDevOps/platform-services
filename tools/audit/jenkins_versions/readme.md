# Purpose
The `ansible` directory provides a playbook to audit the environment and create a list that identifies: 
- Public Jenkins URLS
- Related Project Names
- Running Jenkins Versions

## Requirements
This playbook uses the local `oc` client and user credentials, so ensure you can login with rights to read from all project namespaces. 


## Sample Usage

```
oc login https://console.pathfinder.gov.bc.ca:8443 --token=[token]
ansible-playbook ocp_jenkins_audit.yml
```