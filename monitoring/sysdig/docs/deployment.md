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
oc create secret docker-registry bcgov-docker-hub --docker-server=docker.io --docker-username=bcdevopscluster --docker-password=<your sysdig access key> --docker-email=unused
oc secrets link default bcgov-docker-hub --for=pull
oc label node --all "sysdig-agent=true"

echo "--- Lab cluster - skipping storage region"
for region in master infra app; do
oc apply -f manifests/lab/cm-sysdig-agent-${region}.yml
oc process -f openshift/sysdig-agent-tmpl.yaml --param=REGION=${region} -o yaml | oc apply -f -
done

echo "--- Prod cluster - Adjust default limits and requests"
for region in master infra storage app; do
oc apply -f manifests/prod/cm-sysdig-agent-${region}.yaml
oc process -f openshift/sysdig-agent-tmpl.yaml --param=REGION=${region} --param-file=openshift/prod.env -o yaml | oc apply -f -
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
