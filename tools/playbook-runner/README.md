## Playbook-Runner - Status: WIP

### Usage
This is an interactive container for running Ansible playbooks against an OpenShift Cluster. There is a PV(C) setup with this deployment so container restarts do not cause the loss of any env specific variables, and to improve any use of templates that occationally cause ansible to hang when read from the container filesystem.  

#### Step 1
Copy example.env to <environment>.env and set any necessary variables. (Anything commented (#) has a default value)  
**Required:**  
```
CLUSTER_ENV=<env> (LAB or PROD)
```
**Optional:**
```
K8S_TOKEN=<token to authenticated against k8s api>
```
**Note:** if you're not confortable storing the token in an OpenShift Secret then you can set the  `K8S_AUTH_API_KEY` environment variable before running your playbook.
```
export K8S_AUTH_API_KEY=<token>
```
#### Step 2
Update Playbook Specific Values. Take Aqua for Example:  
```
AQUA_ADMIN_PASSWORD=<password for aqua console>
AQUA_LICENSE=<aqua license>
AQUA_REGISTRY_USER=<aqua reqistry user (email address)>
AQUA_REGISTRY_PASSWORD=<aqua registry user password>
```
  
#### Step 3
**Deploy**  
```
oc process -f ./OpenShift/00-secret-template.yaml --param-file=./OpenShift/lab.env --ignore-unknown-parameters=true | oc apply -f -
oc process -f ./OpenShift/01-deployment-template.yaml --param-file=./OpenShift/lab.env --ignore-unknown-parameters=true | oc apply -f -
```

**Update Secrets if Deployment Already Exists**
```
oc process -f ./OpenShift/00-secret-template.yaml --param-file=./OpenShift/lab.env --ignore-unknown-parameters=true | oc apply -f -
oc rollout latest playbook-runner
```

#### Step 4 - Let's Login and run our playbook
```
oc get pods
oc rsh playbook-runner-11-m4x2z
```

The `K8S_AUTH_API_KEY` and `CLUSTER_ENV` must both be set whether by secret or for this session.  
Let's run `oclogin` which will create `/opt/git` and then clone the platform-services repo into `/opt/git/platform-services`. 
```
oclogin (intentionally without a space -- shell script at /usr/local/bin/oclogin
cd /opt/git/platform-services
git checkout feature/aqua-playbook
# make any edits to playbook vars if needed
cd security/aqua/ansible
ansible-playbook -i lab aqua.yml
```

