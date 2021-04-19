## Cerberus

Use Cerberus for cluster monitoring that serves a go/no-go signal for Uptime Robot.

### Things that Cerberus monitors:
- all nodes: master, infra, app
- if any nodes are marked as schedulable
- cluster Operators
- pods from the specified namespaces
- critical alerts from prometheus:
  - KubeAPILatencyHigh
  - etcdHighNumberOfLeaderChanges

### TODO:
- turn into CCM and create template for configs
- work on dc and configmaps for custom checks

### Docker Image Build (temporary)
```shell
# login:
docker login -u [bcdevops_account]
# make sure subscription entitlement certs exist:
etc-pki-entitlement/
rhsm-ca/
rhsm-conf/

# build and push to specific tag
docker build . --file Dockerfile --tag [bcdevops_account]/cerberus:[lab/prod]
docker push [bcdevops_account]/cerberus:[lab/prod]
```


### Build and Deploy Cerberus

```shell
# expected namespace for cerberus build and deploy to be openshift-bcgov-cerberus
# create a Service Account with custom cluster-reader and rolebinding:
oc -n [namespace] create -f ./devops/cerberus-sa.yml

# get the kube-config locally from the Service Account:
# NOTE: we need the token for kubernetes client.CoreV1Api() authorization
oc -n [namespace] serviceaccounts create-kubeconfig cerberus > config/config

# create configmaps:
oc -n [namespace] create configmap kube-config --from-file=./config/config
oc -n [namespace] create configmap cerberus-config --from-file=./config/config.yaml

# build:
oc -n [namespace] create -f ./devops/cerberus-bc.yml

# deploy cerberus:
oc -n [namespace] create -f ./devops/cerberus.yml
```

### Get Cerberus Monitoring Result:
```shell
# Poke the exposed endpoint -> should get TRUE
oc -n [namespace] get route cerberus-service
curl -i <cerberus_url>

# get monitoring statistics:
curl -i <cerberus_url>/history
curl -i <cerberus_url>/analyze
```

### Troubleshooting:
```shell
# Prometheus Requests failures:
# 1. get the token from SA (prometheus okay with SA that can list namespaces):
oc -n [namespace] sa get-token cerberus
# 2. then use the token to test query prometheus

# cerberus statistics not returning:
# 1. rsh into pod and check for filesystem permission:
ls -al /root/cerberus/history
```

### References:
- https://gexperts.com/wp/building-a-simple-up-down-status-dashboard-for-openshift/
- https://github.com/cloud-bulldozer/cerberus/tree/master/containers
