

# Aporeto Deployment Docs
This document outlines the manual steps used for deploying and configuring the environment. This will be converted to an Ansible playbook for consistency. 

# Namespaces
The following OpenShift namespaces are used for each configured environment: 

| OpenShift Environment Name | OpenShift Project                | Aporeto Namespace Mapping |   |   |
|----------------------------|----------------------------------|---------------------------|---|---|
| LAB                        | devops-platform-security-aporeto | /bcgov-devex/lab          |   |   |
|                            |                                  |                           |   |   |
|                            |                                  |                           |   |   |

# Deployment Steps

- Login with apoctl

```
eval $(apoctl auth aporeto -e \
  --validity 30m \
  --account [aporeto user account] )
```

- Prep the namespace **this example represents the lab instance**

```
# Namespace Prep
helm repo add aporeto https://charts.aporeto.com/clients
export APORETO_NAMESPACE=devops-platform-security-aporeto
export APOCTL_NAMESPACE=/bcgov-devex
export BASE_ENV=lab
export CLUSTER_NAME=kamloops
oc new-project $APORETO_NAMESPACE
oc patch namespace $APORETO_NAMESPACE -p '{"metadata": {"annotations": {"openshift.io/node-selector": ""}}}'


apoctl api create namespace \
--namespace /bcgov-devex \
--api https://api.console.aporeto.com \
--data '{
  "name": "'"$BASE_ENV"'"
}'
```

- Create the OpenShift enforcer profile  & mapping
```

apoctl api import --file profiles/openshift-default-profile.yml -n $APOCTL_NAMESPACE/$BASE_ENV
apoctl api import --file profiles/openshift-default-profile-mapping.yml -n $APOCTL_NAMESPACE/$BASE_ENV

```


# Aporeto Account Prep

- Prep the service account

```
oc adm policy add-scc-to-user privileged -z aporeto-account -n $APORETO_NAMESPACE
apoctl appcred create enforcerd -n $APOCTL_NAMESPACE/$BASE_ENV --type k8s --role "@auth:role=enforcer" | oc apply -f - -n $APORETO_NAMESPACE
apoctl appcred create aporeto-operator -n $APOCTL_NAMESPACE/$BASE_ENV --type k8s --role "@auth:role=aporeto-operator"  |  oc apply -f - -n $APORETO_NAMESPACE
oc get secrets -n $APORETO_NAMESPACE
```


## Deploy Base Policies
- Prior to deploying the operator and encforcers, deploy some base policies for the environment: 

```
eval $(apoctl auth aporeto -e \
  --validity 60m \
  --account [aporeto user account] )


apoctl api import --file external_networks/any.yml -n /bcgov-devex/lab
apoctl api import --file external_networks/lab-host-network.yml -n /bcgov-devex/lab
apoctl api import --file external_networks/cluster-network.yml -n /bcgov-devex/lab
apoctl api import --file networkaccesspolicies/cluster-network-ingress.yml -n /bcgov-devex/lab
apoctl api import --file networkaccesspolicies/internet-egress.yml -n /bcgov-devex/lab
apoctl api import --file networkaccesspolicies/internet-ingress.yml -n /bcgov-devex/lab
apoctl api import --file networkaccesspolicies/global_namespaces.yml -n /bcgov-devex/lab
```

## Tillerless Install
- Install all components using the templating feature of helm

```
helm fetch aporeto/aporeto-crds
helm template ./aporeto-crds-*.tgz \
  | oc apply -f -

helm fetch aporeto/aporeto-operator 
helm template ./aporeto-operator-*.tgz \
  --name aporeto-operator \
  --namespace $APORETO_NAMESPACE \
  | oc apply -f - -n $APORETO_NAMESPACE

helm fetch aporeto/enforcerd
helm template ./enforcerd-*.tgz \
  --namespace $APORETO_NAMESPACE \
  | oc apply -f - -n $APORETO_NAMESPACE
```


- Remove the default operator enforcer profile (**not sure if this is required**)

```
apoctl api delete profile operator-enforcer-profile -n $APOCTL_NAMESPACE/$BASE_ENV
apoctl api delete enforcerprofilemappingpolicies operator-enforcer-profile-mapping -n $APOCTL_NAMESPACE/$BASE_ENV
```

- Patch the daemonset and label nodes to allow us to control the rollout

```
oc patch daemonset enforcerd -n $APORETO_NAMESPACE -p '{"spec": {"template": {"spec": {"nodeSelector": {"aporeto-enforcerd":"true"}}}}}'

## Label infra and compute nodes
oc label nodes ociopf-t-311.dmz ociopf-t-312.dmz ociopf-t-313.dmz ociopf-t-321.dmz ociopf-t-322.dmz  aporeto-enforcerd=true --overwrite=true

## Masters
oc label nodes  ociopf-t-301.dmz ociopf-t-302.dmz ociopf-t-303.dmz aporeto-enforcerd=true --overwrite=true
```

- Verify the daemonset deployment

```
 oc get daemonset
NAME               DESIRED   CURRENT   READY     UP-TO-DATE   AVAILABLE   NODE SELECTOR           AGE
aporeto-enforcer   12        12        12        12           12          aporeto-enforcers=true   66d
```




# References
- [Apoctl Docs](https://junon.console.aporeto.com/docs/main/registration/logging-in-with-apoctl/)
- [Install Docs](https://junon.console.aporeto.com/docs/main/installation/install-on-kubernetes/)
- [OpenShift Helm Blogs](https://blog.openshift.com/getting-started-helm-openshift/)
