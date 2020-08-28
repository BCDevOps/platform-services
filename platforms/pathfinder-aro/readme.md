# Early Adopter Quickstart - Pathfinder Azure Red Hat OpenShift Cluster
Welcome to the quickstart into the **Pathfinder ARO** platform. As this system has been set up in a "learn by doing" manner, this platform will continue to evolve in a "pathfinding" way, with all major anticipated changes will be communicated to the users of the platform through Rocket.Chat. 

## Support Notes
As this system has been set up in the typical "learn by doing" manner, support is currently "best effort" and (unfortunately) of a lower priority to the platform services team. There is **no SLA** with this system and not deemed appropriate for production workloads. 

It should be noted that this system may break and require redeployment. Teams using this platform should be equipped to withstand this type of outage and have the ability to easily redeploy their workloads when it is available again. 

### Support Communications
Please use the Rocket.Chat channel for discussions related to this platform. 
- Rocket.Chat Channel - [devops-aro-operations](https://chat.pathfinder.gov.bc.ca/group/devops-aro-operations)

## Getting Started 
To get started, login to the platform with GitHub: 
- OpenShift Console URL: [https://console-openshift-console.apps.pathfinder.aro.devops.gov.bc.ca/](https://console-openshift-console.apps.pathfinder.aro.devops.gov.bc.ca/)
- OpenShift API Endpoing: [https://api.pathfinder.aro.devops.gov.bc.ca:6443](https://api.pathfinder.aro.devops.gov.bc.ca:6443)

You can obtain your cli login command simlilarly to OCP3.11 by clicking the drop down in the top right corner of the Console UI and selecting `Copy Login Command`. 

```
oc login --token=[token] --server=https://api.pathfinder.aro.devops.gov.bc.ca:6443

```


### Networking & SSL Certificates
OpenShift Routes function in a similar manner as the previous OCP3.11 Pathfinder Cluster.   
Wildcard certificates are installed in the default ingress routers and support the default subdomain `*.apps.pathfinder.aro.devops.gov.bc.ca`. 

This cluster also has the necessary components installed to generate and manage additional LetsEncrypt certificates for alternate hostnames, although this feature isn't fully implemented and tested yet with domains outside of the `pathfinder.aro.devops.gov.bc.ca` subdomain. If you need this feature and cannot provide your own certificates, please reach out to the platform services team for additional testing and guidance. 

### Storage Classes
Two storage classes exist in the platform today: 
- azurefile - Used for applications that need a **file** system or need to have multiple pods access the same filesystem concurrently.
  - RWX storage types fit here.
- managed-premium (default) - Used for applications that need **block** storage and a dedicated storage volume for a single pod.
  - RWO storage types fit here. 

### Namespace Provisioning 
Namespace provisioning is handled by the platform-services team. 

### Access Control with SSO and GitHub
This system is integrated with the BCGov SSO (KeyCloak) service. Usernames will appear in the system as `[github_username]@github`. This is intended to support additional identity providers down the road. 
