# High Level Architecture
This deployment focuses on the following key components: 
- Aporeto Enforcer Daemonset
- Aporeto Kubernetes Operator
- BCGov NetworkSecurityPolicy Operator

#### The Aporeto Enforcer Daemonset
Every node within the cluster runs an Aporeto Enforcer, which is responsible for receiving policy and performing enforcement of the configured policy. It is also responsible for reporting back to the Aporeto cloud control plane. 

#### The Apoerto Kubernetes Operator
The Aporeto Kubernetes Operator is responsible for synchronizing OpenShift projects to Aporeto child namespaces. This is importnat as it helps enforce multi-tenancy across projects  and allows for teams to have different networksecuritypolicy configurations. While it is also capable of configuring policy via custom resources, the BCGov has decided not to leverage this feature in favor of a custom operator. 

#### The BCGov NetworkSecurityPolicy Operator
A custom operator has been developed to create a simplified user specification for configuring network security policies. This allows the BCGov to modify the back-end enforcement technology if desired without having to teach the teams a new specification.

![](./assets/bcgov-aporeto-high-level.png)
