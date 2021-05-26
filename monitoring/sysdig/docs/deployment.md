## Agent Deployment
Currently Sysdig Agents are deployed with Cluster Config Management (CCM). To manually deploy Sysdig to a cluster, see the following requirements and steps.

Deploying Sysdig requires the following k8s components:

- project/namespace with additional privileges
- serviceaccount
- daemonset
- configMap
- secret

*note: disabling agents on lab:storage nodes to get the most coverage (also not enabled in production clusters at the moment)*

``` bash
oc new-project devops-sysdig --description='BC Gov DevOps Platform Sysdig Monitoring Platform'
oc create serviceaccount sysdig-agent
oc adm policy add-scc-to-user privileged -n devops-sysdig -z sysdig-agent
oc adm policy add-cluster-role-to-user cluster-reader -n devops-sysdig -z sysdig-agent
oc create secret generic sysdig-agent --from-literal=access-key=<your_sysdig_access_key> -n devops-sysdig
# currently using docker image from account called bcdevopscluster, will switch to artifactory when ready:
oc create secret docker-registry bcgov-docker-hub --docker-server=docker.io --docker-username=bcdevopscluster --docker-password=<docker_password> --docker-email=unused
oc secrets link default bcgov-docker-hub --for=pull
oc label node --all "sysdig-agent=true"

echo "--- Lab cluster - skipping storage region"
for region in master infra app; do
oc apply -f openshift/lab/cm-sysdig-agent-${region}.yml
oc process -f openshift/sysdig-agent-tmpl.yaml --param=REGION=${region} -o yaml | oc apply -f -
done

echo "--- Prod cluster - Adjust default limits and requests"
for region in master infra storage app; do
oc apply -f openshift/prod/cm-sysdig-agent-${region}.yaml
oc process -f openshift/sysdig-agent-tmpl.yaml --param=REGION=${region} --param-file=openshift/prod.env -o yaml | oc apply -f -
done
```

Once this is complete, update the `devops-sysdig` project to allow for agents to be deployed across the infra, master, and storage nodes as well.

- Edit the namespace:

``` bash
oc edit namespace devops-sysdig
```

- Add the following line within the annotation

``` bash
    openshift.io/node-selector: ""
```
