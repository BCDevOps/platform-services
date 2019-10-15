# Quick Start

## Introduction

New applications deployed to the Platform after Oct 9, 2019 will automatically have Zero-Trust Security Model enabled which means that **all communications for the application components are disabled by default** and only communications explicitely listed in an access policy are allowed. The access policies are enforced on the Platform via the Network Security Policy objects that are defined as *custom resources* in Openshift.


**:point_up: Note**

> **Before your new application can talk to Internet, to the K8S API, to other applications or even within itself, a `NetworkSecurityPolicy` (NSP) needs to be created.**


The sections below will guide you through adding access policies to your application to:

* Allow all Pods to talk to the Internet (Any Network);
* Allow all Pods to talk to one another within a namespace;
* Allow your namespace to talk to the OpenShift Container Platform (OCP) API.

These 3 base policies combined allow application deployed to Openshift 3.11 Platform to keep the same communication open as it was prior to the enablement of the Zero-Trust Security Model on the Platform.

Sample configuration to enable the 3 above mentioned policies can be found in the [quickstart-nsp.yaml](./samples/quickstart-nsp.yaml) file in [samples](./samples) directory accompanying this document. Samples of other access policies can be found [here](./CustomPolicy.md).

**🤓 ProTip**

* 🚫 It is **strongly advised** to create robust and meaninful access policies that match specific requirements of each application. The sample policies are provided for guidance only and should NOT be assumed to be the best practices recommended for all applications.  


## Usage

Check to see if you have any existing NSP. The best and most simple way to view your existing NSP is to use the `oc` command line interface. Run the following command to see installed policy:

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

### Add 3 base access policies to an application

To add 3 base policies to your application, download the [quickstart-nsp.yaml](./samples/quickstart-nsp.yaml) sample file. Edit the file replacing the namespace `devops-platform-security-demo` with the name of the namespace where you intend to apply the policies. 

**:point_up: Note**

> The access policies defined in the NSP will apply to all pods within the namespace.

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

**NOTE** It make take a few moments for your security policy to take effect.

Again, list your NSPs. This time you should see the three policies have been added.  

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

Once an access policy is enabled, you can use the [TestConnection.sh](https://github.com/BCDevOps/openshift-developer-tools/blob/master/bin/testConnection) script available as part of [BCDevOps/openshift-developer-tools](https://github.com/BCDevOps/openshift-developer-tools) repo to test the connectivity of the pods in your namespace.

