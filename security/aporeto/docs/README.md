
# Trust No One

With the addition of new security components Platform Services is able to offer product teams the ability to operate in a Zero Trust model; Zero Trust is a security model you don't trust anything outside of your own components (pods).

This is done by way of creating application identities for each component (Web, API, Database, etc) and based on this identity allowing specific components to talk to one another by creating `NetworkSecurityPolicy` (NSP) or `ExternalNetworks` (EN).

**🤓 ProTip**

* Assume that the network and platform are insecure and built up robust security practices.

## Sections

[Quick Start](./QuickStart.md)

[Custom Network Security Policy](./CustomPolicy.md)

[Custom External Networks](./CustomNetworks.md)
