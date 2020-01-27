## Agent Deployment
Deploying sysdig requires the following k8s components:

- project/namespace with additional privileges
- serviceaccount
- daemonset
- configMap
- secret

*note: currently there are 38 nodes licensed (of our total 42), disabling agents on lab:storage nodes to get the most coverage.*

``` bash
oc new-project devops-sysdig --description='BC Gov DevOps Platform Sysdig Monitoring Platform'
oc create serviceaccount sysdig-agent
oc adm policy add-scc-to-user privileged -n devops-sysdig -z sysdig-agent
oc adm policy add-cluster-role-to-user cluster-reader -n devops-sysdig -z sysdig-agent
oc create secret generic sysdig-agent --from-literal=access-key=<your sysdig access key> -n devops-sysdig
oc create -f manifests/<env>/secret.yml
oc label node --all "sysdig-agent=true"

echo "--- Lab cluster - skipping storage region"
for region in master infra app; do
oc apply -f manifests/lab/configmap-${region}.yml
oc process -f ./openshift/sysdig-agent-tmpl.yaml --param=REGION=${region} -o yaml | oc apply -f -
done

echo "--- Prod cluster - Adjust default limits and requests"
for region in master infra storage app; do
oc apply -f manifests/prod/configmap-${region}.yml
oc process -f ./openshift/sysdig-agent-tmpl.yaml --param=REGION=${region} --param-file=./openshift/prod.env -o yaml | oc apply -f -
done
```

Once this is complete, update the `devops-sysdig` project to allow for agents to be deployed across the infra, master, and gluster nodes as well.

- Edit the namespace:

``` bash
oc edit namespace devops-sysdig
```

- Add the following line within the annotation

``` bash
    openshift.io/node-selector: ""
```
