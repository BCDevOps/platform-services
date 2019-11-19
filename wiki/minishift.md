
# 1 - Dependencies
- docker-machine-driver-xhyve
  - Using homebrew
    ```
    brew install docker-machine-driver-xhyve
    ```
    NOTE: Don't forget to manually run sudo commands (`sudo chown root:wheel ...` and `sudo chmod u+s ...`) shown after installation is finished.
    
  - manually install from [CDK docs](https://access.redhat.com/documentation/en-us/red_hat_container_development_kit/3.7/html-single/getting_started_guide/index#setting-up-xhyve-driver)

# 2 - Setup Red Hat Container Development Kit

Download [Red Hat Container Development Kit](https://developers.redhat.com/products/cdk/download/) - Instructions based on 3.10.0

## 2.1 - For MacOS
```
minishift setup-cdk --force
minishift addons enable registry-route
minishift addons disable anyuid

# Check number of logical CPUs in the machine
sysctl -n hw.ncpu

# Note: Before starting your cluster for the very first time, you will be prompt for a
#       Redhat Developer Login/password.
# You can create a free developer subscription at https://developer.redhat.com
# I found these instructions useful: https://developers.redhat.com/products/cdk/hello-world/
# Particularly: "Add Red Hat Developer Program username to your environment"

$ export MINISHIFT_USERNAME='<RED_HAT_USERNAME>'

# Optional:

$ echo export MINISHIFT_USERNAME=$MINISHIFT_USERNAME >> ~/.bash_profile

# start your cluster: (watch for the prompt to login to your redhat account)

minishift start --openshift-version=3.11.59 --memory=8GB --cpus=8

```

# 2.2 - for Win10 with HyperV

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

# 3 - Configuring Minishift

```

minishift timezone --set America/Vancouver

# Fixing problems with pulling images from "docker-registry.default.svc"
# This does NOT persist on mnishift stop/start
minishift ssh -- 'sudo bash -c "echo 172.30.1.1 docker-registry.default.svc >> /etc/hosts"'

# for the following command to work, you must be logged into minishift as admin
oc login -u admin -p system

oc -n default set env dc/docker-registry REGISTRY_OPENSHIFT_SERVER_ADDR=docker-registry.default.svc:5000

oc adm policy add-scc-to-group hostmount-anyuid system:serviceaccounts
# TODO: try changing workaround for allow default namespace:
# oc adm policy add-scc-to-group hostmount-anyuid system:serviceaccounts:default

```

# 4 - Attach RHEL subscription (enables Red Hat Software Collections)
When you setup minishift, and correctly configure your developer subscription, there will be a subscription pool available, however it will not be _attached_.  This describes how to find the `Pool ID` and attach it.  If you get an error in a build from `microdnf`: `repo rhel-7-server-rpms not found`, you have not correctly setup your subscription in minishift; follow the instructions below.

## Attach "Red Hat Developer Subscription" subscription
```
minishift ssh -- 'sudo subscription-manager refresh && sudo subscription-manager list --available "--matches=Red Hat Developer Subscription" --pool-only | xargs -t -I {} sudo subscription-manager attach "--pool={}"'
```

### Remove "Red Hat Developer Subscription" subscription
This step is only informational in case you need to remove/release subscription

```
minishift ssh -- 'sudo subscription-manager list --consumed "--matches=Red Hat Developer Subscription" --pool-only | xargs -t -I {} sudo subscription-manager remove "--pool={}"'
```

## Assert that the rhscl repos are registered
```
minishift ssh -- 'yum repolist all -y' | grep "rhel-server-rhscl" | wc -l
```
Note: You should see around 9 repositories. Any output grater than 0 should be good.


# 5 - Setting up shared namespaces/resources
```
oc new-project bcgov
oc new-project bcgov-tools

oc policy add-role-to-group system:image-puller 'system:serviceaccounts:bcgov' -n bcgov-tools --rolebinding-name='cross-project-image-pull'

oc policy add-role-to-group system:image-puller 'system:serviceaccounts' -n bcgov --rolebinding-name='any-project-image-pull'

```

# 6 - Import shared images from Pathfinder Openshift
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
oc -n bcgov import-image jenkins-basic --from=docker-registry.pathfinder.gov.bc.ca:443/bcgov/jenkins-basic --confirm --insecure --reference-policy=local --all

oc -n bcgov import-image postgis-96:v1-latest --from=docker-registry.pathfinder.gov.bc.ca:443/bcgov/postgis-96:v1-latest --confirm --insecure --reference-policy=local

# Untested: Fix registry reference
# minishift openshift config set --patch '{"imageConfig": {"internalRegistryHostname": "docker-registry.default.svc:5000"}}' --target master

```

# 7 - Setting up PV
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

# 8 - Create a privileged service account
This account will have `anyuid` privilege so you can run as root and for instance iteratively figure out how to create an image
```
oc -n myproject create sa privileged
oc -n myproject adm policy add-scc-to-user anyuid -z privileged
oc -n myproject run rhel7-tools --serviceaccount=privileged --image=registry.access.redhat.com/rhel7/rhel-tools:latest -it --rm=true --restart=Never --command=true -- bash

```

# 9 - Testing
```
oc import-image helloworld-http:latest --from=registry.hub.docker.com/strm/helloworld-http:latest --confirm
oc new-app --image-stream=helloworld-http:latest --name=helloworld-http
oc expose svc/helloworld-http


oc run rhel7-tools --image=registry.access.redhat.com/rhel7/rhel-tools:latest -it --rm=true --restart=Never --command=true -- bash

oc run rhel7 --image=registry.access.redhat.com/rhel7:latest -it --rm=true --restart=Never --command=true -- bash
oc -n devops-sso-dev run psql --image=registry.access.redhat.com/rhscl/postgresql-96-rhel7:latest -it --rm=true --restart=Never --command=true -- bash


oc run oc --image=registry.access.redhat.com/openshift3/ose-cli:v3.11 -it --rm=true --restart=Never --command=true -- bash

```

# 10 - Restarting

A restart script can be found here:

[restart-minishift.sh](https://raw.githubusercontent.com/BCDevOps/platform-services/cvarjao-cdk-minishift/wiki/assets/restart-minishift.sh)

# 11 - Troubleshooting
```
# Who can PULL images
oc policy who-can get imagestreams/layers
```

# 12 - Uninstall
```
minishift delete
rm -rf ~/.minishift
rm -rf ~/.kube
```

# 13 - Tested Environment
```
$ uname -a
Darwin ***** 18.7.0 Darwin Kernel Version 18.7.0: Tue Aug 20 16:57:14 PDT 2019; root:xnu-4903.271.2~2/RELEASE_X86_64 x86_64

$ minishift version
minishift v1.34.1+21103616
CDK v3.10.0-1

$ minishift config get vm-driver
xhyve

$ docker --version
Docker version 19.03.4, build 9013bf5

$ docker-compose --version
docker-compose version 1.24.1, build 4667896b

$ docker-machine --version
docker-machine version 0.16.2, build bd45ab13

$ docker version
Client: Docker Engine - Community
 Version:           19.03.4
 API version:       1.40
 Go version:        go1.12.10
 Git commit:        9013bf5
 Built:             Thu Oct 17 23:44:48 2019
 OS/Arch:           darwin/amd64
 Experimental:      false

Server: Docker Engine - Community
 Engine:
  Version:          19.03.4
  API version:      1.40 (minimum version 1.12)
  Go version:       go1.12.10
  Git commit:       9013bf5
  Built:            Thu Oct 17 23:50:38 2019
  OS/Arch:          linux/amd64
  Experimental:     true
 containerd:
  Version:          v1.2.10
  GitCommit:        b34a5c8af56e510852c35414db4c1f4fa6172339
 runc:
  Version:          1.0.0-rc8+dev
  GitCommit:        3e425f80a8c931f88e6d94a8c831b9d5aa481657
 docker-init:
  Version:          0.18.0
  GitCommit:        fec3683

```

# References
- https://developers.redhat.com/products/cdk/hello-world/
- https://github.com/minishift/minishift/issues/3144
- https://github.com/minishift/minishift-centos-iso/issues/222
- https://torstenwalter.de/minishift/openshift/homebrew/2017/07/18/install-minishift-on-osx.html
- https://docs.openshift.com/container-platform/3.11/dev_guide/managing_images.html#allowing-pods-to-reference-images-from-other-secured-registries
