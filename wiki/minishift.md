
# Setup Red Hat Container Development Kit (for MacOS)

```
minishift setup-cdk --force
# Calculate the number of CPUS as the Minimun(# of logical CPUs - 2, 2)
minishift start --openshift-version=3.10.72 --memory=8GB --cpus=$(sysctl -n hw.ncpu | awk '{print  $1 - 2}' | awk '{if ($1 < 2 ) { print 2 }  else  { print $1 }}')
minishift addons enable registry-route
minishift addons disable anyuid

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

```

# Testing
```
oc import-image helloworld-http:latest --from=registry.hub.docker.com/strm/helloworld-http:latest --confirm
oc new-app --image-stream=helloworld-http:latest --name=helloworld-http
oc expose svc/helloworld-http


oc run rhel7-tools --image=registry.access.redhat.com/rhel7/rhel-tools:latest -it --rm=true --restart=Never --command=true -- bash

oc run rhel7 --image=registry.access.redhat.com/rhel7:latest -it --rm=true --restart=Never --command=true -- bash


```
