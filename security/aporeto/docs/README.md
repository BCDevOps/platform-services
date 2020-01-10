---
description: This is the Developer Guide for custom network security policy development that product teams can reference to get information on designing and adding custom network security policies to applications hosted on the Openshift platform. The custom policies allow applications teams to take advantage of the new security model that is now available on the platform through the use of the Aporeto software.
tags:
- next gen security
- custom network policy
- Aporeto
- zero trust
- openshift security
- platform security
- network security 
- developer guide
- networksecuritypolicy
---

# Developer Guide to Zero Trust Security Model on the Platform

With the addition of new [security components](../readme.md) BCDevExchange's Platform Services is able to offer product teams the ability to operate in a Zero Trust security model; Zero Trust is a security model where you don't trust anything outside of your own components (pods), even pods don't trust each other!

The model works by using application identities created for each component/Processing Unit/pod (Web, API, Database, etc) of an application and custom network security policies that are added to an application as `NetworkSecurityPolicy` (NSP) custom resource objects (for more advanced solutions, `ExternalNetworks` (EN) objects), to explicity allow communication between the components.  

**:point_up: Note**
* New namespaces provisioned on the Platform after Oct 9, 2019 come with **Zero-Trust Model enabled by default**. In order to enable application pods to communicate with Internet, with the Platform,  with other namespaces, or among themselves, a `NetworkSecurityPolicy` must be **manually** created in the application as described in the [Custom Network Policy Development](./CustomPolicy.md) guide below.



* If your application was deployed to the Platform prior to the secury model install on Oct 9, 2019, **3 base access policies** have been already been added to your application namespaces - DEV, TEST, TOOLS and PROD - to keep their communications running without any impact. To modify the application's base access policy, see the [Quick Start](./QuickStart.md) section below.

**🤓 ProTip**

> * Assume that the network and platform are insecure and build up robust security practices.

## Table of Contents

[Quick Start](./QuickStart.md)

[Custom Network Security Policy Development Guide](./CustomPolicy.md)

[Aporeto Zero Trust Security](../readme.md#aporeto-zero-trust-network-security-enforcement)

[BC Gov's Zero-Trust Model Implementation](../architecture/design_decisions.md#aporeto-design-decisions)

## Support

If you've followed the steps in the guides listed above and things aren't working as you expect and you are stuck, reach out for help in these two RocketChat channels:

| Channel         | Description     |
| --------------- |:----------------|
| #devops-sos     | Use this channel when things are on fire 🔥 and you need immediate help to resolve a production problem. |
| #devops-how-to  | Use this channel to tap into the top-notch OCP community for help. |

## Pilot Projects

This is a list of some projects that have already implemented a Zero Trust security model:

* [Family Protection Order (FPO)](https://github.com/bcgov/Family-Protection-Order) application - [search](https://github.com/bcgov/Family-Protection-Order/search?q=NetworkSecurityPolicy&unscoped_q=NetworkSecurityPolicy) for "networksecuritypolicy" in the repo to see how FPO implemented their network security policies.

* [Court Administration Scheduling API (FPO)](https://github.com/bcgov/cass-api) application


The simplifed Network Diagram for the Pilot Projects is available [here](https://drive.google.com/file/d/1FRkO4vmhLzFOk2vsWwQWha-14bUUh_Yq/view?usp=sharing).


## Network Security and Access Policy Hierarchy

The Zero-Trust Security Model supports policy hierarchies as described [here](../architecture/design_decisions.md#namespace-mapping-heirarchy-and-access-control). Each step in the hierarchy is a placeholder for security rules that propagate to the children policies downstream. This approach allows putting in effect corporate-level, platform-level, data-center level, etc network security policies that will apply to all applications running on the Platform as well as to the legacy and cloud infrastructure where the Zero-Trust Model has been enabled.

If you need to implement a custom security policy that overrides any of the rules included in the platform-level [base policies](../architecture/design_decisions.md#base-policies), use the Rocketchat channels above to get in touch with the DevOps Security team for assistance.

Refer to the [Design Decisions](../architecture/design_decisions.md#namespaces) page to find out how the  control and ownership for access policies is curretnly implemented for the applications hosted on the Platform as well as for the external to the Platform components. 

One of the **possible future** ownership models for the network security policies could look like this:

![Policy Hierarchy](https://drive.google.com/uc?export=view&id=1zjDTANCGRIw_gWmFI6uxyJlFMTkto2ej)

