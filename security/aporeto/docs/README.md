# Introduction

This tutorial will guide you through setting up custom security policy within your OpenShift Container Platform (OCP) namespace, between namespaces, or from your namespace to an external system providid it meets certain criteria.

## Trust No One

With the addition of new security components Platform Services is able to offer product teams the ability to operate in a Zero Trust model; In a Zero Trust is a security model you don't trust anything outside of your own components (pods).

This is done by way of creating application identities for each component (Web, API, Database, etc) and based on this identity allowing specific components to talk to one another by creating `NetworkAccessPolicy` (NAP) or `ExternalNetworks` (EN)

## How it Works

We've worked hard to keep this as simple as possible by allowing you to incorporate NAPs in your OpenShift Container Platform (OCP) deployment manifests.

__Application Identity__

You build application identity by adding labels to the metadata portion of your OCP deployment manifests. For example, in the deployment manifest excerpt below the combination of labels build a unique application identity which can be referenced in the NAP to permit communication.

Its worth noting that each deployment config should have at least one label that uniquely identifies it. in the example below this is accomplished using the `role=api` label; no other deployment will use this specific label.

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



## Naming Convention



```console
app=myapp
role=frontend, role=backend, role=database
env=production
```

## Policy

### Intra-namespace Policy

### Namespace to Namespace

### Namespace to External Network

### Deployment

### Removal

### Troubleshooting


