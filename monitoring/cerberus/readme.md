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
- turn into CCM
- update `quay.io/openshift/origin-tests:latest` tag
- update Dockerfile to take in custom checks

### Build and Deploy Cerberus

```shell
# create a Service Account with cluster-read:
oc -n openshift-monitoring create -f ./devops/cerberus-sa.yml

# get the kube-config locally from the Service Account:
# NOTE: we need the token for kubernetes client.CoreV1Api() authorization
oc -n openshift-monitoring serviceaccounts create-kubeconfig cerberus > config/config

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
curl -i <cerberus_url>

# get monitoring statistics:
curl -i <cerberus_url>/history
curl -i <cerberus_url>/analyze
```

### Troubleshooting:
```shell
# Prometheus Requests failures:
# 1. test if SA has access to obtain prometheus token:
oc -n openshift-monitoring sa get-token prometheus-k8s
# 2. then use the token to test query prometheus

# cerberus statistics not returning:
# 1. rsh into pod and check for filesystem permission:
ls -al /root/cerberus/history
```

### References:
- https://gexperts.com/wp/building-a-simple-up-down-status-dashboard-for-openshift/
- https://github.com/cloud-bulldozer/cerberus/tree/master/containers
