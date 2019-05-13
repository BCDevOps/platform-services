# Purpose
The `ansible` directory provides a playbook to audit the environment and create a list that identifies: 
- Public Jenkins URLS
- Related Project Names
- Running Jenkins Versions

## Requirements
This playbook uses the local `oc` client and user credentials, so ensure you can login with rights to read from all project namespaces. 


## Sample 

```
curl --header "Authorization: Bearer bDfxroot0IQ8Q-quVaUNrP-dsjhSVwdmWaYigp9K7Qk" https://jenkins-c81e6h-tools.pathfinder.gov.bc.ca/ -I | grep "X-Jenkins:" | awk '{print $2}'
```