## Sysdig Monitor Operator

Operator initilizalization with the operator-sdk: 

```
operator-sdk new sysdig-monitor --type ansible --kind Monitoring --api-version ops.gov.bc.ca/v1alpha1 --generate-playbook
```

### Operator Build Details
The operator is running at a version (0.19) that "isn't supported for OCP 3.11", but has been modified to function based on the following examples: 
- [https://github.com/konveyor/mig-operator/blob/master/build/Dockerfile](https://github.com/konveyor/mig-operator/blob/master/build/Dockerfile)
- [https://github.com/konveyor/mig-operator/blob/master/build/entrypoint](https://github.com/konveyor/mig-operator/blob/master/build/entrypoint)

When running in OCP4, this can be refactored into the standard operator-sdk dockerfile. 


## Development Approach
There is a python client if desired, found here: https://github.com/draios/python-sdc-client

We decided to leverage the native API with Ansible for building the Operator functions. The following code can be helful when creating the Ansible URI tasks: https://github.com/draios/python-sdc-client/blob/master/sdcclient/_common.py

### Build Process
The build process is a combination of GitHub Actions and OpenShift Builds. 

1. Any push to a non-master branch will trigger a GitHub Action to trigger a build in the OCP 3.11 Lab cluster. A new deployment must be manually triggered once the build is complete. 
2. A merge into master with any file changes in the sysdig-operator folder will trigger a build in the OCP 3.11 Pathfinder Production cluster. A new deployment must be manually triggered once the build is complete. 

Example GitHub Action: 
```shell
name: sysdig-teams-operator-build-lab
on:
  push:
    branches:
      - '**'
      - '!master'
    paths: 
    - 'monitoring/sysdig/operator/sysdig-monitor/**'
    - '.github/workflows/**'
 
jobs:
  build: 
    runs-on: ubuntu-latest
    steps:
    - name: Get the current branch name
      shell: bash
      run: echo "::set-output name=branch::${GITHUB_REF#refs/heads/}"
      id: branchref
    - uses: actions/checkout@v1
      with:
        ref: ${{ github.ref }}
    - name: OpenShift Action
      uses: redhat-developer/openshift-actions@v1.1
      with:
        version: '3.11.235'
        openshift_server_url: ${{ secrets.LAB_SYSDIG_OPERATOR_OPENSHIFT_SERVER_URL }}
        parameters: '{"apitoken": "${{ secrets.LAB_SYSDIG_OPERATOR_SA_TOKEN }}"}'
        cmd: |
          'project ${{ secrets.LAB_SYSDIG_OPERATOR_PROJECT }}'
          'delete is,bc -l build=gh-actions'
          'new-build https://github.com/BCDevOps/platform-services#${{ steps.branchref.outputs.branch }} --context-dir=monitoring/sysdig/operator/sysdig-monitor --name sysdig-monitor-operator -l build=gh-actions'
```

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
## Using the sdc-cli
The sdc-cli is a utility that can be used to manipulate Sysdig resources. It is packaged in a container[?] but can also be installed with pip.  

**Note: The current version of the sdc-cli requires python3.8 - or more specifically, tatsu 5.5.0 which requires python3.8.**

The sdc-cli has been included in the ansible opertor in order to manipulate dashbaord objects. 

- Installing sdc-cli
```shell
pip3 install sdcclient sdccli 
```

- Using sdc-cli
```shell
export SDC_TOKEN=[sysdig-team-token] # Keep in mind that tokens are team specific
sdc-cli dashboard list
```

### SDC-CLI Resources
- [https://docs.sysdig.com/en/sysdig-cli-for-sysdig-monitor-and-secure.html](https://docs.sysdig.com/en/sysdig-cli-for-sysdig-monitor-and-secure.html)


### Dashboard Template Creation Process
1. Create a "template" dashboard that you like in Sysdig. Typically in the Platform Services team. 
2. Use the *sdc-cli* to get the json output of this
3. Convert into jijna template and integrate into the ansible playbook as appropriate. 


# TODO
- assign view? role to user without defnied role? 
- add in protected teams in validation
- validate that the user has access to the desired namespaces
- test and validate that OIDC is the only option? not sure if this will invite regular sysdig users via email. 
- need to create a bot account
- check on the stability of the swaggar API (which is in development)


## Helpful Commands

**Note: The Dashboard v2 API is being deprecated; the proper path is to use the *sdc-cli***

- Fetching a user API token (since API tokens are team scoped (ugh), this is required to add a dashboard to a specific team)
```shell
curl -H "Authorization: Bearer $SYSDIG_TOKEN" -X GET https://app.sysdigcloud.com/api/token/${USERNAME}/${TEAMID}
{"token":{"key":"key_value"}}
```
- [ref](https://raw.githubusercontent.com/draios/python-sdc-client/master/sdcclient/_common.py)

- Fetch an existing dashboard json 
```shell
sdc-cli --json dashboard get [dashboard-id]
```

## Build Process
GitHub Actions will create a new clean build in the OCP3.11 LAB from whatever branch changes are pushed to. Upon push to master, this build will take place in the OCP3.11 Pathfinder Prod Cluster.

