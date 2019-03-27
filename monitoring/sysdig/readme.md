# Sysdig Application Monitoring

### Purpose
Sysdig is the centralized monitoring tool to support both Monitoring Operations teams and Application teams across the Pathfinder platform. This solution will remove the dependency on "in cluster" monitoring tools and will scale well with additional clusters and cloud workloads. 


## Deployment
Deploying sysdig requires the following k8s components: 
- project/namespace with additional privileges
- serviceaccount
- daemonset
- configMap
- secret

```
oc new-project devops-sysdig --description='BC Gov DevOps Platform Sysdig Monitoring Platform'
oc create serviceaccount sysdig-agent
oc adm policy add-scc-to-user privileged -n devops-sysdig -z sysdig-agent
oc adm policy add-cluster-role-to-user cluster-reader -n devops-sysdig -z sysdig-agent
oc create secret generic sysdig-agent --from-literal=access-key=<your sysdig access key> -n devops-sysdig
oc create -f manifests/<env>/configmap.yml
oc create -f manifests/<env>/secret.yml
oc create -f manifests/<env>/daemonset.yml
oc label node --all "sysdig-agent=true"
```





