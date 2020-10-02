## Cluster Authentication and Authorization

As the platform moves to a multi-cluster environment, it has become largely apparent that _how_ users authenticate with these clusters require 
some form of unification. The platform services team has weighed a few options that will be outlined below. Prior to that, the current
authentication/authorization mechanism is highlighted for the general audience Openshift cluster 3.11. 


## The state of things

- In Openshift 3.11 users are authenticated against a Github OAuth App. 
- The Github App is installed on [BCDevOps Github Org](https://github.com/bcdevops).
- Users __must be__ apart of the BCDevOps org in order to be authorized
- Users __must have__ Github 2fa enabled in order to authorized
- Openshift usernames map directly to a github username.


## Implementation for OCP4 Clusters:
Coming to OCP4, we are to enable IDIR authentication coupled with existing GitHub integration. Here are the basic requirements:
- both IDIR and GitHub platform users can login to OCP
- MFA is required
- GitHub users must be a member of BCDevOps GitHub org in order to have access to OCP


### Option 1: Use SSO KeyCloak for Authentication/Authorization (both IDIR and GitHub)
***Pro:***
- authentication is aligned with Gov's standards of how users access gov services
- single point of authorization
- Authentication source (IDIR|GITHUB) are identified within openshift to allow easier RBAC management. (eg: easy to separate the auth provider in the username for policy clarity)

***Con:***
- Unable to filter/limit Github users by Organization (and force 2FA via organizational requirement)
- No 2FA for IDIR access (combined with above, means we cannot force 2FA for cluster authentication)


### Option 2: Use SSO KeyCloak for Authentication/Authorization (both IDIR and GitHub) with tech preview features
***Pro:***
- Same as Option 1.
- Also provide the security improvement to prevent non-BCDevOps GitHub user to obtain access token
- provides the ability to manage oidc configuration at KeyCloak realm level

***Con:***
- Additional flow development time needed to create custom RBAC/filter flows without current support


### Option 3: Add multiple auth providers to cluster and limit by oidc configuration
***Pro:***
- Allows existing approach for Github access (2FA enforcement, limited org scope, etc)
- Adds second provider for IDIR authentication flow, could enable MFA from day one

***Con:***
- OpenShift RBAC clarity - Usernames in openshift are not as clearly delineated as to their authentication provider source (github users: *jefkel*, idir users: *jefkel@idir*) (could create developer team RBAC management headaches)



### Notes on SSO IDIR and multi-factor-auth:
>
> We have had a discussion with the IDIR MFA team and are aware that IDIR Multi-Factor-Auth is
currently used in production apps for a small set of users (things like Teams).
> - The Platform Services Team (ShellyXueHan, patricksimonian, Nick c) will be beta testing MFA in general against Keycloak late Sept.
> - The process to get onboarded with MFA is manual and requires sending an email with a list of names you would like to have MFA enabled
> - This rollout can take approx. 1 week from what I've gather
> - General MFA rollout will not be available until early next year
> - Before this is available across platform IDIR users, we will leverage SSO OTP (one-time password) as MFA mechanism. 


## Decision on OCP4 implementation:
In a nutshell, we will go with Option 3: direct GitHub oidc configuration on OCP and leverage SSO for IDIR.
Here are the discussion result:
- Option 1 does not meet out requirements because of the lack of MFA
- Option 2 brings uncertainty on support and security concerns with the RedHat tech preview features, we prefer to not take the risk
- Option 3 brings inconvenient for product teams to easily identify user account, but is easy to setup and satisfies main requirements


## Next step:
- setup KeyCloak realms with IDIR configuration
- setup OCP4 clusters with GitHub and SSO oidc configurations and test
- switch existing ARO SSO users to GitHub accounts (details TBD)
- follow up on IDIR MFA, explore on KeyCloak OTP before it's available
- have internal team members to test out authn and authz
