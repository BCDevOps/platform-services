
# Trust No One

With the addition of new security components Platform Services is able to offer product teams the ability to operate in a Zero Trust model; Zero Trust is a security model you don't trust anything outside of your own components (pods).

This is done by way of creating application identities for each component (Web, API, Database, etc) and based on this identity allowing specific components to talk to one another by creating `NetworkSecurityPolicy` (NSP) and, for more advanced solutions, `ExternalNetworks` (EN).

**🤓 ProTip**

* Assume that the network and platform are insecure and built up robust security practices.

## Table of Contents

[Quick Start](./QuickStart.md)

[Custom Network Security Policy](./CustomPolicy.md)

[Custom External Networks](./CustomNetworks.md)

## Support

If things aren't working as you expect and you are stuck reach out for help in these two RocketChat channels:

| Channel         | Description     |
| --------------- |:----------------|
| #devops-sos     | Use this channel when things are on fire 🔥 and you need immediate help to resolve a production problem. |
| #devops-how-to  | Use this channel to tap into the top-notch OCP community for help. |