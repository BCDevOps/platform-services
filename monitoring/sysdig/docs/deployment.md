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

Once this is complete, update the `devops-sysdig` project to allow for agents to be deployed across the infra, master, and gluster nodes as well: 

- Edit the namespace: 
```
oc edit namespace devops-sysdig
```

- Add the following line within the annotation
```
    openshift.io/node-selector: ""
```
