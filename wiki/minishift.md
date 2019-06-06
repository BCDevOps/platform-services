
# Setup Red Hat Container Development Kit (for MacOS)

Download [Red Hat Container Development Kit](https://developers.redhat.com/products/cdk/download/) (tested with CDK v3.8.0-2)
```
minishift setup-cdk --force
minishift addons enable registry-route
minishift addons disable anyuid

# Check number of logical CPUs in the machine
sysctl -n hw.ncpu

minishift start --openshift-version=3.11.59 --memory=8GB --cpus=8

# note: you will be prompt for Redhat Developer Login/password

oc adm policy add-scc-to-group hostmount-anyuid system:serviceaccounts
# TODO: try changing workaround for allow default namespace:
# oc adm policy add-scc-to-group hostmount-anyuid system:serviceaccounts:default

minishift timezone --set America/Vancouver

# Fixing problems with pulling images from "docker-registry.default.svc"
# This does NOT persist on mnishift stop/start
minishift ssh -- 'sudo bash -c "echo 172.30.1.1 docker-registry.default.svc >> /etc/hosts"'

oc -n default set env dc/docker-registry REGISTRY_OPENSHIFT_SERVER_ADDR=docker-registry.default.svc:5000

# Attach RHEL subscription (enables Red Hat Software Collections)
minishift ssh 'sudo bash -c "subscription-manager attach --pool=8a85f99c68b939320168f2d9c3d4748a"'

```

# Setup Red Hat Container Development Kit (for Win10 with HyperV)

minishift is avaliable as Chocolatey package, or download 'cdk-3.8.0-2-minishift-windows-amd64.exe' for Windows from RedHat web site, then rename to 'minishift.exe'

```
cinst minishift -y
```

The steps are the same as above with the following differences:

```
//Check number of logical CPUs in the machine (PS)
$env:NUMBER_OF_PROCESSORS
//Check number of logical CPUs in the machine (cmd)
echo %NUMBER_OF_PROCESSORS%

//configure HyperV before running start
minishift setup

//set the HyperV switch
minishift start --openshift-version=3.11.59 --memory=8GB --cpus=8 --hyperv-virtual-switch=minishift-external
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
# Create a secret using the username/token from https://console.pathfinder.gov.bc.ca:8443/console/command-line
oc -n bcgov create secret docker-registry pathfinder \
    '--docker-server=docker-registry.pathfinder.gov.bc.ca' \
    "--docker-username=<username>" \
    "--docker-password=<token>"

# Use secret for pulling images for pods
oc -n bcgov secrets link default pathfinder --for=pull

# use a secret for pushing and pulling build images
oc -n bcgov secrets link builder pathfinder

# Import/Pull images
oc -n bcgov import-image jenkins-basic:v2-stable --from=docker-registry.pathfinder.gov.bc.ca:443/bcgov/jenkins-basic:v2-stable --confirm --insecure --reference-policy=local

oc -n bcgov import-image postgis-96:v1-latest --from=docker-registry.pathfinder.gov.bc.ca:443/bcgov/postgis-96:v1-latest --confirm --insecure --reference-policy=local

# Untested: Fix registry reference
# minishift openshift config set --patch '{"imageConfig": {"internalRegistryHostname": "docker-registry.default.svc:5000"}}' --target master

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
minishift ssh -- bash <<< 'seq 20 29 | xargs -t -I {} bash -c "sudo rm -rf /var/lib/minishift/base/openshift.local.pv/pv00{}/*"' && seq 20 29 | xargs -t -I {} oc get 'pv/pv00{}' -o json | jq 'del(.spec.claimRef)' | oc replace -f -

```

# Create a privileged service account
This account will have `anyuid` privilege so you can run as root and for instance iteratively figure out how to create an image
```
oc -n myproject create sa privileged
oc -n myproject adm policy add-scc-to-user anyuid -z privileged
oc -n myproject run rhel7-tools --serviceaccount=privileged --image=registry.access.redhat.com/rhel7/rhel-tools:latest -it --rm=true --restart=Never --command=true -- bash

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
- https://torstenwalter.de/minishift/openshift/homebrew/2017/07/18/install-minishift-on-osx.html
- https://docs.openshift.com/container-platform/3.11/dev_guide/managing_images.html#allowing-pods-to-reference-images-from-other-secured-registries


