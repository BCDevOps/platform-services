## Sysdig Monitor Operator

Operator initilizalization with the oeprator-sdk: 

```
operator-sdk new sysdig-monitor --type ansible --kind Monitoring --api-version ops.gov.bc.ca/v1alpha1 --generate-playbook
```

## Development Approach
There is a python client if desired, found here: https://github.com/draios/python-sdc-client

We decided to leverage the native API with Ansible for building the Operator functions. The following code can be helful when creating the Ansible URI tasks: https://github.com/draios/python-sdc-client/blob/master/sdcclient/_common.py

## Sample Variables
The following variables are used to define the Sysdig Team:

```
team: 
  name: test-team
  description: some silly description here 
  namespaces: 
    - usage-cost
  users:
   - name: husker@arctiq.ca
     role: ROLE_TEAM_READ 
   - name: shea.stewart+bcgov@arctiq.ca
     role: ROLE_TEAM_MANAGER
   - name: shea.stewart+tester@arctiq.ca
     role: ROLE_TEAM_EDIT
   - name: boomer@arctiq.ca
     role: ROLE_TEAM_READ 
```
## Sample Payloads
These sample payloads might be useful when managing the operator templates: 

- Sample Sysdig Team JSON Structure
```
{   
    "canUseAwsMetrics": false,
    "canUseCustomEvents": true,
    "canUseSysdigCapture": true,
    "default": false,
    "description": "some silly description here",
    "entryPoint": {
        "module": "Dashboards"
    },
    "name": "test-team",
    "show": "container",
    "theme": "#73A1F7",
    "filter": "kubernetes.namespace.name in (\"usage-cost\")",
    "userRoles": [
      {
        "userId": "26462",
        "role": "ROLE_TEAM_READ"
      }
        ,
        {
        "userId": "25956",
        "role": "ROLE_TEAM_MANAGER"
      }
        ,
        {
        "userId": "31736",
        "role": "ROLE_TEAM_EDIT"
      }
        ,
        {
        "userId": "27002",
        "role": "ROLE_TEAM_READ"
      }
       
    ]
}
```

# TODO
- assign view? role to user without defnied role? 