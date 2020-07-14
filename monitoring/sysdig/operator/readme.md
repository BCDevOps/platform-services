## Sysdig Monitor Operator

Operator initilizalization with the operator-sdk: 

```
operator-sdk new sysdig-monitor --type ansible --kind Monitoring --api-version ops.gov.bc.ca/v1alpha1 --generate-playbook
```

## Development Approach
There is a python client if desired, found here: https://github.com/draios/python-sdc-client

We decided to leverage the native API with Ansible for building the Operator functions. The following code can be helful when creating the Ansible URI tasks: https://github.com/draios/python-sdc-client/blob/master/sdcclient/_common.py

## Usage
- Custom Resources must be created in the `*-tools` namespace
- Users need to specify the users (by email address) 
- The playbook will automatically add all `tools`, `dev`, and `prod` namespaces into the team scope (there is no need to specify this)


## Sample Custom Resource
The following variables are used to define the Sysdig Team:

```
apiVersion: ops.gov.bc.ca/v1alpha1
kind: SysdigTeam
metadata:
  name: example-monitoring
spec:
  team: 
    description: some silly description here 
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
- add in protected teams in validation
- validate that the user has access to the desired namespaces
- test and validate that OIDC is the only option? not sure if this will invite regular sysdig users via email. 
- need to create a bot account

## Helpful Commands

- Create a dashboard
```shell
curl -H "Authorization: Bearer $SYSDIG_TOKEN" -H "Content-Type: application/json" -X POST -d @./dashboard_requests_and_limits.json https://app.sysdigcloud.com/api/v2/dashboards/ 
```
- Get a dashboard
```shell
curl -H "Authorization: Bearer $SYSDIG_TOKEN" -X GET https://app.sysdigcloud.com/api/v2/dashboards/137400 | jq .
```

- Fetching a user API token (since API tokens are team scoped (ugh), this is required to add a dashboard to a specific team)
```shell
curl -H "Authorization: Bearer $SYSDIG_TOKEN" -X GET https://app.sysdigcloud.com/api/token/${USERNAME}/${TEAMID}
{"token":{"key":"key_value"}}
```
- [ref](https://raw.githubusercontent.com/draios/python-sdc-client/master/sdcclient/_common.py)

## Build Process
GitHub Actions will create a new clean build from whatever branch changes are pushed to. This should be replaced with a method by which the lab environment is tested prior to a simple deployment into production. 