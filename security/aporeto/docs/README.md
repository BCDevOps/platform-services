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

# Trust No One

With the addition of new security components BCDevExchange's Platform Services is able to offer product teams the ability to operate in a Zero Trust security model; Zero Trust is a security model where you don't trust anything outside of your own components (pods), even pods don't trust each other!

The model works by using application identities created for each component/Processing Unit/pod (Web, API, Database, etc) of an application and custom network security policies that are added to an application as `NetworkSecurityPolicy` (NSP) custom resource objects (for more advanced solutions, `ExternalNetworks` (EN) objects), to explicity allow communication between the components.  

**:point_up: Note**
* New namespaces provisioned on the Platform after Oct 9, 2019 come with **Zero-Trust Model enabled by default**. In order to enable application pods to communicate with Internet, with the Platform,  with other namespaces, or among themselves, a `NetworkSecurityPolicy` must be **manually** created in the application as described in the *QuickStart* guide below.

* Communication rules defined in the custom network security policy described in the `NetworkSecurityPolicy` object must be created for **both direction** in order to enable the communication, e.g. namespace A is allowed talk to namespace B AND namespace B is allowed to talk to namespace A. 

```
spec:
  description: |
    allow nmspc1-dev to talk to nmspc2-dev
  destination:
    - - $namespace=nmspcA-dev
    - - $namespace=nmspcB-dev
  source:
    - - $namespace=nmspcB-dev
    - - $namespace=nmspcA-dev
``` 

**🤓 ProTip**

* Assume that the network and platform are insecure and built up robust security practices.

If your application was deployed to the Platform prior to the secury model install on Oct 9, 2019, 3 base access policies have been added to all application namespaces - DEV, TEST, TOOLS and PROD - to keep their communications running without any impact. To modify the application's base access policy, see the [Custom Network Security Policy](./CustomPolicy.md) section below.


## Table of Contents

[Quick Start](./QuickStart.md)

[Custom Network Security Policy](./CustomPolicy.md)

[Custom External Networks](./ExternalNetworks.md)

## Support

If you've followed the steps in the guides listed above and things aren't working as you expect and you are stuck, reach out for help in these two RocketChat channels:

| Channel         | Description     |
| --------------- |:----------------|
| #devops-sos     | Use this channel when things are on fire 🔥 and you need immediate help to resolve a production problem. |
| #devops-how-to  | Use this channel to tap into the top-notch OCP community for help. |

## Projects

This is a list of some projects that have already implemented a Zero Trust security model:

* [Family Protection Order (FPO)](https://github.com/bcgov/Family-Protection-Order) application - [search](https://github.com/bcgov/Family-Protection-Order/search?q=NetworkSecurityPolicy&unscoped_q=NetworkSecurityPolicy) for "networksecuritypolicy" in the repo to see how FPO implemented their network security policies.

* [Court Administration Scheduling API (FPO)](https://github.com/bcgov/cass-api) application
