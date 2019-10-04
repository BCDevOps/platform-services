# Introduction

This tutorial will guide you through setting up custom security policy within your OpenShift Container Platform (OCP) namespace, between namespaces, or from your namespace to an external system provided it meets certain criteria.

## Trust No One

With the addition of new security components Platform Services is able to offer product teams the ability to operate in a Zero Trust model; In a Zero Trust is a security model you don't trust anything outside of your own components (pods).

This is done by way of creating application identities for each component (Web, API, Database, etc) and based on this identity allowing specific components to talk to one another by creating `NetworkAccessPolicy` (NAP) or `ExternalNetworks` (EN).

**🤓 ProTip**

* Assume that the network and platform are insecure and built up robust security practices.

## How it Works

We've worked hard to keep this as simple as possible by allowing you to incorporate NAPs in your OpenShift Container Platform (OCP) deployment manifests.

__Application Identity__

You build application identity by adding labels to the metadata portion of your OCP deployment manifests. For example, in the deployment manifest excerpt below the combination of labels build a unique application identity which can be referenced in the NAP to permit communication.

Its worth noting that each deployment config should have at least one label that uniquely identifies it. In the example below this is accomplished using the `role=api` label; no other deployment will use this specific label. See the **Naming Convention** section below for best practices. 

```yaml
- kind: DeploymentConfig
  apiVersion: v1
  metadata:
    name: "${NAME}"
    labels:
      name: "${NAME}"
      app: ${APP_NAME}
      role: api
      env: production
    annotations:
      description: Defines how to deploy the application server
  spec:
    strategy:
  ...
```

**🤓 ProTip**

* Add the `role=` label to each deployment config of your manifest to uniquely identify the pods.


## Naming Convention

The naming convention you use for labels that allow you to build your application identity should be no more complicated than necessary.

| Label | Values        | Description     |
| ----- |:-------------:| ---------------:|
| app  | name          | Use the `app` label to group all your deployment components. This *won't* be unique. |
| role | frontend, backend, database, etc.| Use the `role` label to uniquely identify a pod by its purpose. |
| env  | dev, test, prod | Use the `env` label to correlate with the namespace the application runs in. |

In the samples below two deployments are configured in an deployment manifest. The values for `NAME` and `APP_NAME` are parameters making them common to both the Web and API deployments. This is a common convention used in OCP (and k8s) deployments.

The `env` label will change based on the namespace the deployment targets and the `role` uniquely identifies the deployment.

**Web**
```yaml
  metadata:
    name: "${NAME}"
    labels:
      name: "${NAME}"
      app: ${APP_NAME}
      role: web
      env: production
```

**API**
```yaml
  metadata:
    name: "${NAME}"
    labels:
      name: "${NAME}"
      app: ${APP_NAME}
      role: api
      env: production
```

**🤓 ProTip**

* K.I.S - Keep It (your labels) Simple; don't try and outsmart yourself.
* Where possible use the naming convention proposed here for uniformity across projects.

## Policy

The policy below will provide most teams enough to get up and running in short order; Customize them with labels or template parameters as needed. If you find the sample policy below does not suite your needs contact platform services to help create more advanced policy.

In the subsections below we'll use one or more tags to identify the source and destination systems. The relevance if `source` and `destination` is that the application identified in the `source` will be able to open a network connection to the application identified in `destination`; Once a connection is open then data is able to flow bidirectionally.

| Field | Required | Description     |
| ----------- |:--------:| ---------------:|
| name        | YES      | Use this field to uniquely identify policy. |
| description | YES      | A brief description of what the policy does. |
| source      | YES      | Tags used to identify the application that can initiate a network connection. |
| destination | YES      | Tags used to identify the application that receives the network connection.

See the `samples` folder accompanying these instructions for more information.

### Intra-namespace

This sample policy is used to allow pods to communicate within a given namespace; there is no need to supply the name of the namespace for this policy by default as it is implied. Create a policy similar to this one for each system that needs to open a network connection to another system. In a simple application this would typically include:

* Web to API
* API to Database

```yaml
apiVersion: secops.pathfinder.gov.bc.ca/v1alpha1
kind: NetworkSecurityPolicy
metadata:
  name: web2api-permit
spec:
  description: |
    allow the Web pod(s) to communicate to the API pod(s).
  source:
    - - app=myapp
    - - role=web
    - - env=production
  destination:
    - - app=myapp
    - - role=api
    - - env=production
```

### External Network to Namespace 

This sample policy is used to allow external networks to communicate with pods; typically use this type of policy to accept connections from the the Interweb 🧐. Create a policy similar to this one for each system that needs to **receive** connections from the Internet.

The sample below allows the Web pod(s) to accept connections to from the Internet.

```yaml
- kind: NetworkSecurityPolicy
  apiVersion: secops.pathfinder.gov.bc.ca/v1alpha1
  metadata:
    name: external-ingress
  spec:
    description: |
      Allow the frontend (web) to receive connections from the Internet.
    source:
      - - ext:network=any
    destination:
      - - app=myapp
      - - role=web
      - - env=production
```

**🤓 ProTip**

* You can define your own external networks using an `ExternalNetwork` described later in this document.

### Namespace to External Network 

This sample policy is used to allow pods to communicate with an external network; typically use this type of policy to talk to the Interweb 🧐. Create a policy similar to this one for each system that needs to **create** connections to the Internet or other parts of the BCGov (SPANBC) network.

The sample below allows the API pod(s) to open connections to any system on the Internet.

```yaml
- kind: NetworkSecurityPolicy
  apiVersion: secops.pathfinder.gov.bc.ca/v1alpha1
  metadata:
    name: external-ingress
  spec:
    description: |
      Allow the frontend (web) to receive connections from the Internet.
    source:
      - - app=myapp
      - - role=api
      - - env=production
    destination:
      - - ext:network=any
```

### Namespace to Namespace



### Deployment

### Removal

### Troubleshooting


