# Vault Consumer Guide

In this guide, you will learn how to write and consume secrets from Vault.
The guide is intended to be a living document, and will need to be reviewed at regular intervals to ensure the high accuracy.

## Introduction

After the project provisioning workflow has created the prerequisites for using Vault, you will find
a new Kubernetes Service Account (KSA) in each of your app namespaces (tools, dev, test, and prod).
The KSA is named `appName-nonprod` for the namespaces tools, dev, and test, where appName is the ID or
license plate for your app, e.g., `fi4Gh`.
For the prod namespace, the KSA is called `appName-prod`.

To view the KSA in a specific namespace use the following commands. Append `-o yaml` for more details.

```bash
# for tools, dev, test
oc get sa appName-nonprod -n appName-tools
oc get sa appName-nonprod -n appName-dev
oc get sa appName-nonprod -n appName-test

# for prod
oc get sa appName-prod -n appName-prod
```

Example output below:

```yaml
# example output with parameter: -o yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  labels:
    app: vaulttest
  name: app
  namespace: vclient-dev
secrets:
- name: app-token-pjtpt
```

The KSA is used by the Vault sidecar container to inject secrets into your application pods.
The following annotations are necessary for your application manifests.

Overview of the annotations:

| Annotation                                                  | Description |
|-------------------------------------------------------------|-------------|
| vault.hashicorp.com/auth-path: "auth/k8s-silver"            | Vault Kubernetes Authentication Backend to authenticate against. There is one backend for each OpenShift cluster. Choose from: "auth/k8s-klab", "auth/k8s-clab", "auth/k8s-silver", or "auth/k8s-silverdr"            |
| vault.hashicorp.com/role: "appName-nonprod" or "appName-prod" | Vault role that defines access to secrets. Replace appName with your app ID, for example, `fi4Gh`. Replace `-nonprod` with `-prod` for your app `-prod` namespace. |
| vault.hashicorp.com/agent-inject-secret-helloworld: "appName-nonprod/dev/helloworld" | Configures the Vault Agent to get the secrets from Vault required by the container. The name of the secret is any unique string after `vault.hashicorp.com/agent-inject-secret-`, such as `vault.hashicorp.com/agent-inject-secret-helloworld`. The value is the path in Vault where the secret is located. |
| vault.hashicorp.com/agent-inject-template-helloworld:       | Configures the template Vault Agent should use for rendering a secret. Use the same value as above, in the example `-helloworld`. |

The example below is for the OpenShift silver cluster and one of the app nonprod namespaces: tools, dev, or test).

```yaml
# patch-template-annotations.yaml
spec:
  template:
    metadata:
      annotations:
        vault.hashicorp.com/agent-inject: "true"
        vault.hashicorp.com/auth-path: "auth/k8s-silver"
        vault.hashicorp.com/role: "appName-nonprod"
        vault.hashicorp.com/agent-inject-secret-helloworld: "appName-nonprod/dev/helloworld"
        vault.hashicorp.com/agent-inject-template-helloworld: |
          {{- with secret "appName-nonprod/data/dev/helloworld" }}
          {{ .Data.data.helloworld }}
          {{ end }}
```

Apply the patch to your deployment and verify you can read the secret within the pod.

```bash
oc patch deployment app --patch "$(cat patch-template-annotations.yaml)"
oc exec -ti appName-pod -- cat /vault/secrets/helloworld
```

## Reference

Visit the vendor documentation for a complete list of available annotations.

[Vault - Kubernetes Annotations](https://www.vaultproject.io/docs/platform/k8s/injector/annotations)