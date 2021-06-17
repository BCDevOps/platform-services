---
title: Patroni Cluster Setup in Openshift 4
description: This resource provides instructions for setting up a Patroni cluster in the Openshift 4 environment.
tags:
  - openshift
  - patroni
  - postgresql
  - ha
  - database
  - high availability cluster
---

# Patroni Cluster Setup in Openshift 4

## Source & Credit
Contributed to and copied from https://github.com/zalando/patroni

## Additional Information
This documentation contains primarily examples on how to get patroni running on our Openshift cluster. For full documentation on Patroni, please see https://patroni.readthedocs.io/en/latest/

## Patroni OpenShift Configuration
Patroni can be run in OpenShift. Based on the kubernetes configuration, the Dockerfile and Entrypoint has been modified to support the dynamic UID/GID configuration that is applied in OpenShift. This can be run under the standard `restricted` SCC.

## Examples

### Create test project

```
oc new-project patroni-test
```

### Build the image

> Note: Update the references when merged upstream.
>
> Note: If deploying as a template for multiple users, the following commands should be performed in a shared namespace like `openshift`.

``` bash
oc process -f openshift/build.yaml \
 -p "GIT_URI=$(git config --get remote.origin.url)" \
 -p "GIT_REF=$(git rev-parse --abbrev-ref HEAD)" \
 -p SUFFIX=-pg11 \
 -p OUT_VERSION=v11-latest \
 -p PG_VERSION=11 | oc create -f -

# Trigger a build
oc start-build patroni-pg11

#HINT: avoid unnecessary commits and build from current git clone/checkout directory.
#oc start-build patroni-001 "--from-dir=$(git rev-parse --show-toplevel)" --wait

oc tag patroni:v11-latest patroni:v11-stable
```

Simply change the OUT_VERSION and the PG_VERSION if you would like a build with a different postgres base (also created a separate buildconfig in this example for parallel builds):

``` bash
oc process -f openshift/build.yaml \
 -p "GIT_URI=$(git config --get remote.origin.url)" \
 -p "GIT_REF=$(git rev-parse --abbrev-ref HEAD)" \
 -p SUFFIX=-pg10 \
 -p OUT_VERSION=v10-latest \
 -p PG_VERSION=10 | oc create -f -
 ```

> Note: `oc create` is used for the build explicitly to avoid overwriting/updating the postgres imageStream object.  Additional postgres imageStream Tags are added as long as the PG_VERSION tag does not exist in the imageStream.

### Deploy the statefulSet

> Note: `oc create` is used for the pre-requisites to avoid re-generating secrets accidentally

``` bash
oc process -f openshift/deployment-prereq.yaml \
 -p NAME=patroni \
 -p SUFFIX=-001 | oc create -f -

oc process -f openshift/deployment.yaml \
 -p NAME=patroni \
 -p "IMAGE_STREAM_NAMESPACE=$(oc project -q)" \
 -p "IMAGE_STREAM_TAG=patroni:v11-latest" \
 -p REPLICAS=3 \
 -p SUFFIX=-001 | oc apply -f -

# HINT: Internal registry changed between OCP3 and OCP4.  Current default is for OCP4.  Simply add the following option to the deployment.yaml to deploy on OCP 3.11
# -p IMAGE_REGISTRY=docker-registry.default.svc:5000
```

Additional helpful operational cli samples:

``` bash
oc scale StatefulSet/patroni-001 --replicas=1 --timeout=1m
oc scale StatefulSet/patroni-001 --replicas=0 --timeout=1m && oc delete configmap/patroni-001-config

oc delete configmap,statefulset,service,endpoints -l cluster-name=patroni-001

# Clean everthing
oc delete all -l cluster-name=patroni-001
oc delete pvc,secret,configmap,rolebinding,role -l cluster-name=patroni-001
```

### Template Options

Two configuration templates exist in [templates](templates) directory:
- Patroni Ephemeral
- Patroni Persistent

The only difference is whether or not the statefulset requests persistent storage.

### Create the Template
Install the template into the `openshift` namespace if this should be shared across projects:

``` bash
oc create -f templates/template_patroni_ephemeral.yml -n openshift
oc create -f templates/template_patroni_persistent.yml -n openshift
```

Then, from your own project:

``` bash
oc new-app patroni-pgsql-ephemeral
```

Once the pods are running, two configmaps should be available:

``` bash
$ oc get configmap
NAME                DATA      AGE
patroniocp-config   0         1m
patroniocp-leader   0         1m
```

### Development

Install minishift and use the scripts in `test/*` to build/deploy/test

- `test/e2e.sh`: runs all tests
- `test/build.sh`: Test Build
- `test/deploy.sh`: Test Deployment
   - `test/patroni.sh`: Test Patroni
   - `test/psql.sh`: Test PostgreSQL

### Troubleshooting

Find tips for troubleshooting problems with a Patroni cluster [here](https://github.com/bcgov/nr-get-token/wiki/Patroni-Troubleshooting)

### TODO

- [x] Need to add anti-affinity rules
- [ ] Investigate using redhat postgres image as base image

### References
- https://github.com/sclorg/postgresql-container/blob/generated/10/root/usr/bin/run-postgresql
- https://github.com/sclorg/postgresql-container/blob/generated/10/root/usr/share/container-scripts/postgresql/common.sh
