# Introduction

This tutorial will guide you through setting up custom security policy within your OpenShift Container Platform (OCP) namespace, between namespaces, or from your namespace to an external system provided it meets certain criteria.

## Trust No One

With the addition of new security components Platform Services is able to offer product teams the ability to operate in a Zero Trust model; In a Zero Trust is a security model you don't trust anything outside of your own components (pods).

This is done by way of creating application identities for each component (Web, API, Database, etc) and based on this identity allowing specific components to talk to one another by creating `NetworkAccessPolicy` (NAP) or `ExternalNetworks` (EN).

**ProTip**

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

**ProTip**

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

**ProTip**

* K.I.S - Keep It (your labels) Simple; don't try and outsmart yourself.
* Where possible use the naming convention proposed here for uniformity across projects.

## Policy

### Intra-namespace Policy

### Namespace to Namespace

### Namespace to External Network

### Deployment

### Removal

### Troubleshooting


