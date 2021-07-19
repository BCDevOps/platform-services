# Sysdig Team Operator

For each new app team onboarding to Sysdig, we leverage the `Sysdig Team Operator` to automatically create the team scopes and default dashboards on Sysdig, based on specifications set from the Custom Resource. There is an Ansible Operator installed in each OpenShift Cluster. Currently this is considered as part of the Cluster Configuration, so all changes go thought the standard CCM process.

# Operational Approaches:

## Build
Ideally the build process would be a combination of GitHub Actions and OpenShift Builds, where the OpenShift build pushes the image to Artifactory. Due to some limitation, we are currently using a Docker account deployment is based on the build docker image from docker.io directly.

1. Any push to a non-master branch will trigger a GitHub Action to trigger a build in the OCP Lab cluster. A new deployment must be manually triggered once the build is complete. 
2. A merge into master with any file changes in the sysdig/operator folder will trigger a build in the OCP Production cluster. A new deployment must be manually triggered once the build is complete. 

Example GitHub Action can be found [here](../../../.github/workflows/sysdig-teams-operator-build-lab.yaml).

## Development
The output manifest from kustomize build are copied over to CCM repo for the actual operator deployment. For any changes in the operator, please follow the next part.

## Operator Update Steps:
- Preparation:
  ```shell
  brew install operator-sdk
  brew install python3
  pip3 install ansible ansible-runner ansible-runner-http
  ```

- Init:
  ```shell
  operator-sdk init --plugins=ansible --domain ops.gov.bc.ca
  operator-sdk create api --help
  operator-sdk create api --version=v1alpha1 --kind=SysdigTeam --generate-playbook --generate-role
  ```
  NOTE: we'll need to switch the CRD name from sysdigteam to sysdig-team to match existing CRs

- Ansible playbook:
  - copy over the original playbooks and roles (mind the path update)
  - update watches.yaml and add finalizers
  - would run locally to test out (remember to set local env vars for the sysdig token)

- Building docker image:
  ```shell
  docker login -u bcdevopscluster
  docker build . --file Dockerfile --tag bcdevopscluster/sysdig-teams-operator:lab
  docker push bcdevopscluster/sysdig-teams-operator:lab
  # NOTE: would use Makefile or start a PR and leverage Github action for build
  ```

- Operator manifest with Kustomize:
  - add patches in manager/rbac/default for deployment and SA updates
  - include patch files in corresponding `kustomization.yaml`
  - generate the manifest:
  ```shell
  kustomize build config/default > manifest.yaml
  ```

- Manual testing: (soon to be automated)
  - in a lab cluster, turn off argoCD auto sync
  - apply the `manifest.yaml`
  - create/edit/delete sample sysdig team
  - verify operator logs and sysdig team status from Sysdig console

# Usage:

## Operator:

- Custom Resources must be created in the `*-tools` namespace
- Users need to specify the users (by email address that's associated with the user account) 
- The playbook will automatically add all `tools`, `dev`, `test` and `prod` namespaces into the team scope (there is no need to specify this)

### Samples:

You can see a sample Custom Resource for Sysdig-team [here](sysdig-monitor/config/samples/_v1alpha1_sysdigteam.yaml)


## Ansible Playbook:

We decided to leverage the native Sysdig API with Ansible for building the Operator functions for now.

### Sysdig API:
Please note an admin access REAL user account is required to run the API requests from the Ansible playbooks, the token can be obtained from https://app.sysdigcloud.com/#/settings/user -> Sysdig Monitor API. It would be better to consider a service account on Sysdig if possible.

Some references:
- https://docs.sysdig.com/en/sysdig-rest-api-conventions.html
- the following code can be helpful when creating the Ansible URI tasks: https://github.com/draios/python-sdc-client/blob/master/sdcclient/_common.py


### Alternative: Using the sdc-cli
The sdc-cli is a utility that can be used to manipulate Sysdig resources. It is packaged in a container[?] but can also be installed with pip.

Some references:
- https://github.com/draios/python-sdc-client
- https://docs.sysdig.com/en/sysdig-cli-for-sysdig-monitor-and-secure.html

**NOTE: The current version of the sdc-cli requires python3.8 - or more specifically, tatsu 5.5.0 which requires python3.8.**

The sdc-cli has been included in the ansible operator in order to manipulate dashboard objects. 

- Installing sdc-cli
```shell
pip3 install sdcclient sdccli 
```

- Using sdc-cli
```shell
export SDC_TOKEN=[sysdig-team-token] # Keep in mind that tokens are team specific
sdc-cli dashboard list
```

### Dashboard Template Creation Process
1. Create a "template" dashboard that you like in Sysdig. Typically in the Platform Services team. 
2. Use the *sdc-cli* to get the json output of this
3. Convert into jinja template and integrate into the ansible playbook as appropriate. 

**NOTE: The Dashboard v2 API is being deprecated (https://docs.sysdig.com/en/dashboard-apis.html); the proper path is to use the *sdc-cli***

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

### Samples:

Sysdig [teams](sysdig-monitor/roles/sysdigteam/samples/teams.json) and [users](sysdig-monitor/roles/sysdigteam/samples/users.json) payload from API requests

# TODO
- migrate API to sdc-cli for team template management
- assign view? role to user without defined role? 
- add in protected teams in validation
- validate that the user has access to the desired namespaces
- test and validate that OIDC is the only option? not sure if this will invite regular sysdig users via email. 
- need to create a bot account
- check on the stability of the swaggar API (which is in development)
