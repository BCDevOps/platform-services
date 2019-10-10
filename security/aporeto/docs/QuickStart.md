---
description: Quickly apply NetworkSecurityPolicy to get your pods communicating as a first step towards a Zero Trust environment.
tags:
- security
- firewall
- devsecops
- networking
---

# Quick Start

## Introduction

While it is **strongly advised** to create meaningful bespoke application identities, and accompanying `NetworkSecurityPolicy` (NSP) to secure your project, there are circumstances where a more open policy are desired. For the purpose of this document this will be referred to as an Open Security Model (OSM).

The sections below will guide you through adding sufficient policy to:

* Allow all Pods to talk to the Internet (Any Network);
* Allow all Pods to talk to one another within a namespace;
* Allow your namespace to talk to the OpenShift Container Platform (OCP) API.

**🤓 ProTip**

* 🚫 Use this technique sparingly. Its ill advised to circumvent security best practices.
* Use [this](./CustomPolicy.md) resource to create bespoke NSPs.

## Usage

Check to see if you have any existing NSP. The best and most simple way to view your existing NSP is to use the `oc` command line interface. Run the following command to see installed policy:

```console
oc get networksecuritypolicy
```

If don't have any existing policy, no results will appear. If you do already have NSP continue reading to understand how the OSM policy is named so you can determine if its already been applied.

```console
NAME                    AGE
```

Go to the [samples](./samples) directory accompanying this document where you'll find the manifest file [quickstart-nsp.yaml](./samples/quickstart-nsp.yaml). This manifest contains the three base policies needed to implement our open security model.

| Name                       | Description     |
| ---------------------------|:----------------|
| egress-internet | Allow Pods to communicate with the Internet.|
| int-cluster-k8s-api-permit | Allow Pods to communicate to the k8s API; this is needed for deployments.|
| intra-namespace-comms | Allow Pods to communicate amongst themselves within a namespace.|

Edit the YAML file replacing the namespace `devops-platform-security-demo` with the name of the namespace you intend to install the NSP. If you're not sure of the exact name use the `oc project` command to find out what project you're using.

```console
oc project
```

Shows a result similar to the following:

```console
Using project "devex-von-tools" on server "https://console.lab.pathfinder.gov.bc.ca:8443".
```

Once you have edited the policy replaceing the namespace then apply the policy as follows:

```console
oc apply -f samples/quickstart-nsp.yaml
```

**NOTE** It make take a few moments for your security policy to take effect.

Again, list your NSP. This time you should see three policies have been added.  

```console
oc get networksecuritypolicy
```

This command produces the following result:

**NOTE** If you have NSP that was setup to allow backwards compatibility the name may have the namespace postfix appended to it.

```console
NAME                                AGE
egress-internet                     1d
int-cluster-k8s-api-permit          1d
intra-namespace-comms               1d
```

You can inspect a policy by fetching it in YAML format with the following command:

```console
oc get networksecuritypolicy egress-internet -o yaml
```

The results are quite detailed, but the part you mainly need to be aware of is the `spec` (excerpt shown below.)

```yaml
spec:
  description: |
    allow devex-von-tools to talk to the internet
  destination:
  - - ext:network=any
  source:
  - - $namespace=devex-von-tools
```
