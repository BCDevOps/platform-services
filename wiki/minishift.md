
# Setup Red Hat Container Development Kit (for MacOS)

Download [Red Hat Container Development Kit](https://developers.redhat.com/products/cdk/download/)
```
minishift setup-cdk --force
minishift addons enable registry-route
minishift addons disable anyuid

# Calculate the number of CPUS as the Minimun(# of logical CPUs - 2, 2)
minishift start --openshift-version=3.11.59 --memory=8GB --cpus=$(sysctl -n hw.ncpu | awk '{print  $1 - 2}' | awk '{if ($1 < 2 ) { print 2 }  else  { print $1 }}')

# note: you will be prompt for Redhat Developer Login/password

oc adm policy add-scc-to-group hostmount-anyuid system:serviceaccounts
# TODO: try changing workaround for allow default namespace:
# oc adm policy add-scc-to-group hostmount-anyuid system:serviceaccounts:default


```
# Setting up shared namespaces/resources
```
oc new-project bcgov
oc new-project bcgov-tools

oc policy add-role-to-group system:image-puller 'system:serviceaccounts:bcgov' -n bcgov-tools --rolebinding-name='cross-project-image-pull'

oc policy add-role-to-group system:image-puller 'system:serviceaccounts' -n bcgov --rolebinding-name='any-project-image-pull'

```

# Import shared images from Pathfinder Openshift
```
# Open Minishift Web Console
minishift console

# `oc login` to minishift: openshift minishift web console, and copy+paste login command
# oc login ...

#Create target ImageStreams which we will use to push images to:
oc -n bcgov create imagestream postgis-96

# connects to minishift docker registry:
eval $(minishift docker-env)

# login to pathfinder cluster: Go to pathfinder openshift web console, and copy+paste login command
# oc login ...

# `docker login` to pahtfinder cluster
docker login -u `oc whoami` -p `oc whoami -t` docker-registry.pathfinder.gov.bc.ca

# pull images
docker pull docker-registry.pathfinder.gov.bc.ca/bcgov/postgis-96:v1-latest
docker pull docker-registry.pathfinder.gov.bc.ca/bcgov/postgis-96:v1-latest

# `oc login` to minishift
# oc login ...

# `docker login` to minishift
docker login -u `oc whoami` -p `oc whoami -t` `oc -n default get route/docker-registry -o custom-columns=host:.spec.host --no-headers`:443

# push images to minishift
docker tag docker-registry.pathfinder.gov.bc.ca:443/bcgov/postgis-96:v1-latest "172.30.1.1:5000/bcgov/postgis-96:v1-latest"
docker push "172.30.1.1:5000/bcgov/postgis-96:v1-latest"


oc -n default set env dc/docker-registry REGISTRY_OPENSHIFT_SERVER_ADDR=docker-registry.default.svc:5000

minishift openshift config view
minishift openshift config set --patch '{"imageConfig": {"internalRegistryHostname": "docker-registry.default.svc:5000"}}' --target master

#curl `https://docker-registry.default.svc:5000/v1/_ping`

minishift openshift restart
```

# Setting up PV
```
# Fix/Patch PV directory
minishift ssh -- "sudo chmod -R a+rwx /var/lib/minishift/base/openshift.local.pv*"

# Create supported StorageClass
oc create -f minishift-storage-class.yaml

# Minishift will automatically create 100 PVs
# allocate PVs to storageClassName as needed

# Reserve 10 (pv0010 to pv0019) to gluster-file-db
seq 10 19 | xargs -I {} oc patch 'pv/pv00{}' -p '{"spec":{"storageClassName": "gluster-file-db"}}'

# Reserve 10 (pv0020 to pv0029) to gluster-block
seq 20 29 | xargs -I {} oc patch 'pv/pv00{}' -p '{"spec":{"storageClassName": "gluster-block"}}'

# Reserve 10 (pv0030 to pv0039) to gluster-file
seq 30 39 | xargs -I {} oc patch 'pv/pv00{}' -p '{"spec":{"storageClassName": "gluster-file"}}'


#scrub (from within minishift ssh)
seq 20 29 | xargs -t -I {} bash -c 'sudo rm -rf /var/lib/minishift/base/openshift.local.pv/pv00{}/*'

#Remove PV claims and set as available
seq 20 29 | xargs -t -I {} oc get 'pv/pv00{}' -o json | jq 'del(.spec.claimRef)' | oc replace -f -

```

# Testing
```
oc import-image helloworld-http:latest --from=registry.hub.docker.com/strm/helloworld-http:latest --confirm
oc new-app --image-stream=helloworld-http:latest --name=helloworld-http
oc expose svc/helloworld-http


oc run rhel7-tools --image=registry.access.redhat.com/rhel7/rhel-tools:latest -it --rm=true --restart=Never --command=true -- bash

oc run rhel7 --image=registry.access.redhat.com/rhel7:latest -it --rm=true --restart=Never --command=true -- bash
oc -n devops-sso-dev run psql --image=registry.access.redhat.com/rhscl/postgresql-96-rhel7:latest -it --rm=true --restart=Never --command=true -- bash


oc run oc --image=registry.access.redhat.com/openshift3/ose-cli:v3.11 -it --rm=true --restart=Never --command=true -- bash 

```

# Troubleshooting
```
# WHo can PULL images
oc policy who-can get imagestreams/layers
```

# Uninstall
```
minishift delete
rm -rf ~/.minishift
rm -rf ~/.kube
```

# References
- https://github.com/minishift/minishift/issues/3144
- https://github.com/minishift/minishift-centos-iso/issues/222

