# Setup Argo CD Operator in OpenShift 4

This document references the following GitHub repository:

https://github.com/argoproj-labs/argocd-operator

## Create the Namespace

`oc new-project argocd`

## Setup the ServiceAccounts, Roles and 

* Clone GitHub repository

```
oc create -f https://raw.githubusercontent.com/argoproj-labs/argocd-operator/master/deploy/service_account.yaml
oc create -f https://raw.githubusercontent.com/argoproj-labs/argocd-operator/master/deploy/role.yaml
oc create -f https://raw.githubusercontent.com/argoproj-labs/argocd-operator/master/deploy/role_binding.yaml
 ```

### Optional:

`oc adm policy add-cluster-role-to-user cluster-admin -z argocd-application-controller -n argocd`

## Add Argo CD CRD's

```
oc create -f https://raw.githubusercontent.com/argoproj-labs/argocd-operator/master/deploy/argo-cd/argoproj.io_applications_crd.yaml
oc create -f https://raw.githubusercontent.com/argoproj-labs/argocd-operator/master/deploy/argo-cd/argoproj.io_appprojects_crd.yaml
```

## Add Argo CD Operator CRD's

```
oc create -f https://raw.githubusercontent.com/argoproj-labs/argocd-operator/master/deploy/crds/argoproj.io_argocdexports_crd.yaml
oc create -f https://raw.githubusercontent.com/argoproj-labs/argocd-operator/master/deploy/crds/argoproj.io_argocds_crd.yaml
```

## Deploy Argo CD Operator

```
oc create -f https://raw.githubusercontent.com/argoproj-labs/argocd-operator/master/deploy/operator.yaml
```


## Deploy ArgoCD Cluster

* Deploy the operator amd subscribe (tested with version 0.0.6)

## Retrieving the admin password

In version 0.0.6 of the Argo CD operator, the admin password changed from the `argocd-server` POD name and is now stored in the secret `argocd-cluster`

https://argocd-operator.readthedocs.io/en/latest/usage/basics/#secrets

`oc get secret example-argocd-cluster -o jsonpath='{.data.admin\.password}' | base64 -d`

## Expose Service 

`oc create route passthrough argo --service=argocd-server --port=https --insecure-policy=Redirect`

## Change the Admin Password

oc -n argocd patch secret argocd-secret \
  -p '{"stringData": {
    "admin.password": "$2a$04$DrDE7ivaXQc2422ea5pCP.pNKiZ0xO418CpFYShqLbN56hwkSvcuG",
    "admin.passwordMtime": "'$(date +%FT%T%Z)'"
  }}'

oc patch secret argocd-secret  -p '{"data": {"admin.password": null, "admin.passwordMtime": null}}'

kubectl patch secret -n argocd argocd-secret \
  -p '{"stringData": { "admin.password": "'$(htpasswd -bnBC 10 "" Arct1q! | tr -d ':\n')'"}}'


## Resources 

https://www.openshift.com/blog/openshift-authentication-integration-with-argocd