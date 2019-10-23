# Aporeto Design Decisions

## Namespaces
Aporeto namespaces are used to logically group objects such as, `enforcers`, `network access policies`, `external networks`, and so on. Each namespace can have a parent namespace and children namespaces. Access control can he placed at the namespace level, and any parent namespace can propogate it's objects to children namespaces. This is an important as the overall structure can help simplify the deployment of security policiy across a large group of Aporeto peocessing units if placed at the right place in the heiararchy. 


## Namespace Naming Convention
At this point in time, the Aporeto namespace naming convention and heiarachy is intended to: 
- align with the appropriate teams who may have need access to control policy
- provide an overall governance capability at the root of the namespace 
- support the pattern where teams outside of **Platform Services** will own and manage their own Aporeto resources and policies

The top level parent namespace is: 
- **/bcgov**

The next child namespace provides separation between *Platform Services* and *other teams*: 
- **/bcgov/platform-services**
- **/bcgov/apps**

The next set of child namespaces identifies either the type of enviornment or the sector: 
- **/bcgov/platform-services/non-production**
- **/bcgov/platform-services/production**
- **/bcgov/platform-services/nr**

Please see the next section for the current namespace mapping policy. 

## Namespace Mapping Heirarchy and Access Control
The following table outlines the namespace heirarchy and high-level access / ownership. Please update this table periodically as new teams are onboarded into the platform. 

| Team / Sector     | Namespace                                                     | Description                                                     | Access Control                       | Notes                                                                                                             |
|-------------------|---------------------------------------------------------------|-----------------------------------------------------------------|--------------------------------------|-------------------------------------------------------------------------------------------------------------------|
| Platform Services | /bcgov                                                        | Root / Parent Namespace                                         |                                      |                                                                                                                   |
| Platform Services | /bcgov/platform-services                                      | Platform-Services enforcers and policies                        | DXC / Platform Services              |                                                                                                                   |
| Platform Services | /bcgov/platform-services/non-production                       | Non Prod Container Platform Resources                           | Access propagated from parent        |                                                                                                                   |
| Platform Services | /bcgov/platform-services/non-production/kamloops              | Kamloops Non Prod Container Platform Resources                  | Access propagated from parent        |                                                                                                                   |
| Platform Services | /bcgov/platform-services/non-production/kamloops/lab          | No description                                                  | Access propagated from parent        |                                                                                                                   |
| Platform Services | /bcgov/platform-services/non-production/kamloops/lab/ocp311   | No description                                                  | Access propagated from parent        | Holds all lab cluster enforcers and base policies                                                                 |
| Platform Services | /bcgov/platform-services/non-production/kamloops/lab/ocp311/* | No description                                                  | Access propagated from parent        | Child namespaces are automatically created /mapped to OpenShift Projects. End users don’t leverage this cluster.  |
| Platform Services | /bcgov/platform-services/production                           | No description                                                  | Access propagated from parent        |                                                                                                                   |
| Platform Services | /bcgov/platform-services/production/kamloops                  | No description                                                  | Access propagated from parent        |                                                                                                                   |
| Platform Services | /bcgov/platform-services/production/kamloops/pathfinder       | No description                                                  | Access propagated from parent        | Holds all production pathfinder cluster enforcers and base policies                                               |
| Platform Services | /bcgov/platform-services/production/kamloops/pathfinder/*     | No description                                                  | Access propagated from parent        | Child namespaces are automatically created /mapped to OpenShift Projects                                          |
| Nobody            | /bcgov/app                                                    | Parent namespace to hold sector related enforcers and policiesj | No access definied at this level yet | General namespace to separate App or Team specific resources from Container Platform related resources            |
| NR                | /bcgov/apps/nr                                                | Natural Resources Sector                                        | NR Team                              |                                                                                                                   |
| NR                | /bcgov/apps/nr/non-prod                                       | Natural Resources Sector Non-Prod                               | Access propagated from parent        |                                                                                                                   |
| NR                | /bcgov/apps/nr/non-prod/calgary                               | Natural Resources Sector Non-Prod Calgary                       | Access propagated from parent        |                                                                                                                   |


## Base Policies 
A series of "base" policies exist for the container platform specifically. These base policies are applied relative to the namespaces they need to be enforced upon, for example, the lab base policies are maintained in `/bcgov/platform-services/non-production/kamloops/lab/ocp311` while the production pathfinder base policies are maintained in `/bcgov/platform-services/production/kamloops/pathfinder`. These base policies are used to ensure that the OpenShift platform operates correctly with Aporeto deployed and are deployed with during the installation of Aporeto into the platform. They do not leverage the BCGov NetworkSecurityPolicy Operator for managing policy, and as a result, these policies can only be reviewed/edited by the Aporeto ansible playbook or through the Aporeto CLU/UI with the appropriate permissions. 

Please refer to the **Playbook Flow** section of the Ansible [Build Docs ](../build/ansible/readme.md) for a list of the base policies and their descriptions. These are created in the `apply_policies.yml` section of the playbook. 

### Policy Naming Conventions
There are no hard restrictions on what developers will use for naming their policies. Every policy created by an end-user in the platform will be have a name that follows the convention: 
- `custom-[object-type]-[object-name]`

Developers can use any name that they wish for the object-name, however, it should be easy to determine what the policy does by it's name. This will help other team members when they are reviewing these objects. Some examples are outlined in the [developer guide](../docs/CustomPolicy.md). 

### Fallback Policies 
Aporeto has a concept of **Fallback Policies** that can be used to generate a more permissive and forgiving policy that would be used if users have not created any other matching policy. It was determined that with the desire to achieve a Zero Trust network enforcement policy that fallback policies are not leveraged in this deployment. New container-platform teams will start to consider their desired network flow of their applications and will manually create NetworkSecurityPolicy objects to allow network traffic to flow. 

### Developer Controlled Policies
Each OpenShift project/namespace is directly mapped to an Aporeto child namespace and developers are enabled to create / edit / delete Network Access Policies for their applications. This is achieved through the BCGov NetworkSecurityPolicy Operator and Custome Resource Definitions. Please refer to the [Developer Docs](../docs/README.MD) for additional details and instructions. 

**Please Note:** Child namespace Network Access Policies cannot override policies that are created at a parent or higher level. This is how application teams can create more granular policies for their applications, but security teams within government can apply high-level policies that are propagated to these child namespaces. 



### Namespace Automation
There are two key automations in place for Aporeto Namespace management: 
- The Aporeto Operator synchronizes OpenShift projects into child namespaces
- A Namespace Management playbook has been created to codify all higher-level namespaces and access control
  - Currently resides in the private repo [bcgov-c/platform-services-secops](https://github.com/bcgov-c/platform-services-secops)
  - This playbook should be used for authorization and namespace management and manual configuration should be avoided
  - The desire is likely to have this playbook fully integrated into a GitOps approach


## Operations
This section describes any additional opreational design decisions that apply to this solution. 

### Backup
A backup CronJob has been created to backup all configurations and policy within the `/bcgov` namespace on a daily basis. This can be used as secondary audit trail of daily configuration changes and can be leveraged if needed to re-import specific configurations into the Aporeto SaaS console. These backups are stored in the private git repo [bcgov-c/platform-secops-netpol](https://github.com/bcgov-c/platform-secops-netpol). Please refer to that repository for more details if you have the required access. 


## Access Control 
Access control to namespaces is managed through the Namespace Automation playbook referenced above. In order for users to gain access to their namespace, they must: 
- have the appropriate authorization policy created by the Namespace Automation playbook
- have a proper email account tied to their github ID
- be authorized by Keycloak as the OIDC provider and must have 2FA enabled

### OIDC Configuration: 
Currently 2 OIDC providers are available: 
- pathfinder-sso-prod
- pathfinder-sso-dev

It's likely we will remove the dev OIDC provider option as the solution is more widely used.
The KeyCloak prod intance uses the following realm for client access: `8gyaubgq`. 

