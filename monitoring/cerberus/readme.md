## Cerberus

Use Cerberus for cluster monitoring that serves a go/no-go signal for Uptime Robot.

### Things that Cerberus monitors:
- [x] cluster Operators
- [x] critical alerts from prometheus:
  - KubeAPILatencyHigh
  - etcdHighNumberOfLeaderChanges
- [ ] cluster nodes: master, infra, app (too aggressive, using custom checks instead)
- [ ] all pods from the specified namespaces (too aggressive, using custom checks instead)
- [x] custom checks: 
  - monitoring on the 5 major cluster services identified in [Miro board](https://miro.com/app/board/o9J_kgyjm_k=/)
  - image registry / Artifactory
  - ingress service
  - API service
  - worker nodes
  - NetApp storage (Trident backend)


Here is an example of the monitoring output that reflects the above monitors:
```
10.97.84.1 - - [07/Jul/2021 22:47:28] "GET / HTTP/1.1" 200 -
2021-07-07 22:48:13,528 [INFO] -------------------------- Iteration Stats ---------------------------
2021-07-07 22:48:13,528 [INFO] Time taken to run watch_nodes in iteration 5642: 20.987691402435303 seconds
2021-07-07 22:48:13,528 [INFO] Time taken to run watch_cluster_operators in iteration 5642: 21.139723539352417 seconds
2021-07-07 22:48:13,528 [INFO] Time taken to run watch_namespaces in iteration 5642: 19.242046356201172 seconds
2021-07-07 22:48:13,529 [INFO] Time taken to run sleep_tracker in iteration 5642: 19.27062702178955 seconds
2021-07-07 22:48:13,529 [INFO] Time taken to run entire_iteration in iteration 5642: 81.93008351325989 seconds
2021-07-07 22:48:13,529 [INFO] ----------------------------------------------------------------------

2021-07-07 22:48:34,290 [INFO] Iteration 5643: Node status: True
2021-07-07 22:48:34,362 [INFO] Iteration 5643: Cluster Operator status: True
2021-07-07 22:48:53,600 [INFO] Iteration 5643: openshift-etcd: True
10.97.84.1 - - [07/Jul/2021 22:48:28] "GET / HTTP/1.1" 200 -
2021-07-07 22:48:53,602 [INFO] HTTP requests served: 13152

2021-07-07 22:48:53,602 [INFO] ------------------- Start Custom Checks -------------------
2021-07-07 22:49:12,793 [INFO] Check if Ready nodes are more than 80 percent of all nodes.
2021-07-07 22:49:13,996 [INFO] Check cluster readyz endpoint.
2021-07-07 22:49:14,015 [INFO] Check Image Registry API and test on routing layer.
2021-07-07 22:49:14,562 [INFO] Detected Image Registry API: https://image-registry.apps.silver.devops.gov.bc.ca/healthz
2021-07-07 22:49:15,044 [INFO] Check if netapp storages are all available.
2021-07-07 22:49:15,322 [INFO] -> TridentBackends tbe-7pr79
2021-07-07 22:49:15,611 [INFO] -> TridentBackends tbe-976nm
2021-07-07 22:49:15,926 [INFO] -> TridentBackends tbe-gqf65
2021-07-07 22:49:15,238 [INFO] -> TridentBackends tbe-mwpfn
2021-07-07 22:49:15,517 [INFO] -> TridentBackends tbe-ncvw9
2021-07-07 22:49:15,599 [INFO] ------------------- Finished Custom Checks -------------------

2021-07-07 22:49:15,776 [INFO] Sleeping for the specified duration: 60
```

### TODO:
- build cronjob for full application life cycle monitoring

### Docker Image Build (temporary)
```shell
# login:
docker login -u [bcdevops_account]
# make sure subscription entitlement certs exist:
etc-pki-entitlement/
rhsm-ca/
rhsm-conf/
# make sure the custom checks exist:
custom_checks/custom_checks.py

# build and push to specific tag
docker build . --file Dockerfile --tag [bcdevops_account]/cerberus:[lab/prod] --squash
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
oc create configmap cerberus-config --from-file=./config/cerberus-config-template.yaml
# Optional, for local testing only (included in docker image already)
oc create configmap cerberus-custom-check --from-file=./custom_checks/custom_checks.py

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
- setup: https://gexperts.com/wp/building-a-simple-up-down-status-dashboard-for-openshift/
- deploy containerized version: https://github.com/cloud-bulldozer/cerberus/tree/master/containers
- custom checks: https://github.com/cloud-bulldozer/cerberus#bring-your-own-checks
