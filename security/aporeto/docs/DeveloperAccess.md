---
description: Gaining Access to the Aporeto Console to view Network Security Policies, External Networks, Processing Units (PUs), and Network Flows
tags:
- next gen security
- Console Authorization Policy
- Aporeto
- Developer Access

---
# Developer Access to the Aporeto Console

## Introduction 
In order to gain access to the Aporeto Console to view `NetworkSecurityPolicies`, `ExternalNetworks`, Processing Units (Pods - PUs), and Network Flows between PUs you must create a `ConsoleAuthorizationPolicy` (`cap`) Custom Resource within your OpenShift 4 namespace. 

>**Note:** The `ConsoleAuthorizationPolicy` or `cap` for short must be named `viewers`, and any other name will be ignored. 

## ConsoleAuthorizationPolicy Setup  

### Check if the policy already exists

```sh
oc get consoleauthorizationpolicies -n ${NAMESPACE}
oc get caps -n ${NAMESPACE}
```

### Create a `cap` using the template below or by modifying the existing resource:  

```yaml
apiVersion: security.devops.gov.bc.ca/v1alpha1
kind: ConsoleAuthorizationPolicy
metadata:
  name: viewers
spec:
  users:  
    - <github_id>@<github>
```

#### Apply the `cap` in your OpenShift 4 namespace

```sh
oc apply -f ${NAMESPACE}-cap.yaml
```

## Logging into the Aporeto Console

Browse to https://console.aporeto.com and Select "Sign-in with OIDC" from the drop down menu. Enter `bcgov` in the "Account or namespace" field.

__Insert Screen Shot Here__


## Generating Bookmarks for accesing your Namespaces in the Aporeto Console

__TODO__

## Demo

__TODO__
