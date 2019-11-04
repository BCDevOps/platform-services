---
description: How-to tutorial for adding custom network security policies to applications hosted on the Openshift platform to allow product teams to take advantage of the new security model that is now available on the platform through the use of the Aporeto software.
tags:
- next gen security
- custom network policy
- Aporeto
- zero trust
- openshift security
- platform security
---

# Quick Start

## Introduction

New applications deployed to the Platform after Oct 9, 2019 will automatically have Zero-Trust Security Model enabled which means that **all communications for the application components are disabled by default** and only communications explicitely listed in a application's custom network security policy are allowed (with the exception of communications included in the platform-level [base policies](../architecture/design_decisions.md#base-policies)). 

**🤓 ProTip**
>Read more [here](../readme.md) about the security software that enforces the Zero-Trust Model on the Platform.

The network security policies for applications are enforced on the Platform via the Network Security Policy objects that are defined as *custom resources* in Openshift. 

**:point_up: Note**

> **Before your new Openshift application can talk to Internet, to the K8S API, to other applications or even within itself, a `NetworkSecurityPolicy` (NSP) needs to be created.**

> Communication rules defined in the custom network security policy described in the `NetworkSecurityPolicy` object must be created for **both directions** in order to enable the communication, e.g. namespace A is allowed talk to namespace B AND namespace B is allowed to talk to namespace A. 

```
spec:
  description: |
    allow nmspcA-dev to talk to nmspcB-dev
  destination:
    - - $namespace=nmspcA-dev
    - - $namespace=nmspcB-dev
  source:
    - - $namespace=nmspcB-dev
    - - $namespace=nmspcA-dev
``` 

The sections below will guide you through adding network security policies to your application to:

* Allow all Pods to talk to the Internet (Any Network);
* Allow all Pods to talk to one another within a namespace;
* Allow your namespace to talk to the OpenShift Container Platform (OCP) API.

These 3 base policies combined allow application deployed to Openshift 3.11 Platform to keep the same communication open as it was prior to the enablement of the Zero-Trust Security Model on the Platform.

Sample configuration to enable the 3 above mentioned policies can be found in the [quickstart-nsp.yaml](./sample/quickstart-nsp.yaml) file in [samples](./sample) directory accompanying this document. Samples of other network security policies can be found [here](./CustomPolicy.md).

**🤓 ProTip**

* 🚫 It is **strongly advised** to create robust and meaninful network security policies that match specific requirements of each application. The sample policies are provided for guidance only and should NOT be assumed to be the best practices recommended for all applications.  Refer to [Custom Policy Development Guide](./CustomPolicy.md) for step-by-step instructions for developing custom network security policies for an application.


## Usage

Check to see if you have any existing NSPs. The best and most simple way to view your existing NSPs is to use the `oc` command line interface. Run the following command to see installed policy:

```console
oc get networksecuritypolicy
```

If your application has been pre-populated with the 3 base policies, the output should look like this:

```console
NAME                                    AGE
egress-internet-uwsgva-dev              7d
int-cluster-k8s-api-permit-uwsgva-dev   7d
intra-namespace-comms-uwsgva-dev        7d
```

| Name                       | Description     |
| ---------------------------|:----------------|
| egress-internet | Allow Pods to communicate with the Internet.|
| int-cluster-k8s-api-permit | Allow Pods to communicate to the k8s API; this is needed for deployments.|
| intra-namespace-comms | Allow Pods to communicate amongst themselves within a namespace.|

If don't have any existing policy, no results will appear. 
If you want to modify an existing base policy, you need to remove the old policy first and add a new policy as shown [here](./CustomPolicy.md#remove-it).

### Add 3 base network security policies to an application

To add 3 base policies to your application, download the [quickstart-nsp.yaml](./sample/quickstart-nsp.yaml) sample file. Edit the file replacing the namespace `devops-platform-security-demo` with the name of the namespace where you intend to apply the policies. 

**:point_up: Note**

> The namespace-level network security policies defined in the NSP will apply to all pods within that namespace.

If you're not sure of the exact name use the `oc project` command to find out what project you're using.

```console
oc project
```

Shows a result similar to the following:

```console
Using project "devex-von-tools" on server "https://console.lab.pathfinder.gov.bc.ca:8443".
```

Once you have edited the sample policy YAML file replacing the namespace, save the changes and apply the policy as follows:

```console
oc apply -f samples/quickstart-nsp.yaml
```

**NOTE:** It may take a few moments for your security policy to take effect.

**🤓 ProTip**

* It is recommended to stick the policy naming convention as described [here](../architecture/design_decisions.md#policy-naming-conventions) and prefix the application's policy name with the word `custom-`.


Again, list your NSPs. This time you should see the three policies have been added.  

```console
oc get networksecuritypolicy
```

This command produces a result similar to the following:


```console
NAME                                AGE
custom-egress-internet                     1d
custom-int-cluster-k8s-api-permit          1d
custom-intra-namespace-comms               1d
```
**NOTE** If you have NSP that was setup to allow backwards compatibility the name may have the namespace postfix appended to it.

You can inspect a policy by fetching it in the YAML format with the following command:

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


### Test application connectivity

Once a network security policy is enabled, you can use the [TestConnection](https://github.com/BCDevOps/openshift-developer-tools/blob/master/bin/testConnection) script available as part of [BCDevOps/openshift-developer-tools](https://github.com/BCDevOps/openshift-developer-tools) repo to test the connectivity of the pods in your namespace.

### Add Network Security Policy code to your repo

It is recommended to use the `oc apply` command only while designing a network security policy. Once the policy is finalized, store it in the application's repo in GitHub together with the rest of the OCP templates for the application component that the policy applies to and where it can be included in the deployment pipeline for your application. (See [BC Gov's Openshift Developer Tools](https://github.com/BCDevOps/openshift-developer-tools) and [BC Developer Kit](https://github.com/BCDevOps/bcdk) repos that include a variety of deployment automation scripts for developers). 

**🤓 ProTip**

* See [Family Protection Order (FPO)](https://github.com/bcgov/Family-Protection-Order) and [Court Administration Scheduling API](https://github.com/bcgov/cass-api) repos and search for "networksecuritypolicy" to see where the security policies are stored within the repo structure.