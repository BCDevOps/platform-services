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

With the addition of new security components Platform Services is able to offer product teams the ability to operate in a Zero Trust model; Zero Trust is a security model you don't trust anything outside of your own components (pods).

This is done by way of creating application identities for each component (Web, API, Database, etc) and based on this identity allowing specific components to talk to one another by creating `NetworkSecurityPolicy` (NSP) and, for more advanced solutions, `ExternalNetworks` (EN).

**:point_up: Note**
* New namespaces provisioned on the Platform after Oct 9, 2019 come with **Zero-Trust Model enabled by default**. In order to enable application pods to communicate with Internet, with the Platform,  with other namespaces, or among themselves, a `NetworkSecurityPolicy` must be **manually** created in the application is described in the *QuickStart* guide below.

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

[Family Protection Order](https://github.com/bcgov/Family-Protection-Order)
