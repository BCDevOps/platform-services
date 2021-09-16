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

## Option 1: Replace all Auth with SSO (both IDIR and GitHub) (without tech preview features)
> Notes on SSO IDIR and multi-factor-auth:
>
>We have had a discussion with the IDIR MFA team and are aware that IDIR Multi-Factor-Auth is
currently used in production apps for a small set of users (things like Teams).
> - The Platform Services Team (ShellyXueHan, patricksimonian, Nick c) will be beta testing MFA in general against Keycloak late Sept.
> - The process to get onboarded with MFA is manual and requires sending an email with a list of names you would like to have MFA enabled
> - This rollout can take approx. 1 week from what I've gather
> - General MFA rollout will not be available until early next year

### Pro:
- single point of authorization
- Authentication source (IDIR|GITHUB) are identified within openshift to allow easier RBAC management. (eg: easy to separate the auth provider in the username for policy clarity)
### Con:
- Unable to filter/limit Github users by Organization (and force 2FA via organizational requirement)
- No 2FA for IDIR access (combined with above, means we cannot force 2FA for cluster authentication)


## Option 2: Replace all Auth with SSO (both IDIR and GitHub) (with tech preview features)

### Pro:
- Same as Option 1.
### Con:
- Additional flow development time needed to create custom RBAC/filter flows without current support (more investigation needed to determine approach to use)


## Option 3: Add multiple auth providers to cluster and limit by oidc configuration
### Pro:
- Allows existing approach for Github access (2FA enforcement, limited org scope, etc)
- Adds second provider for IDIR authentication flow
### Con:
- OpenShift RBAC clarity - Usernames in openshift are not as clearly delineated as to their authentication provider source (github users: *jefkel*, idir users: *jefkel@idir*) (could create developer team RBAC management headaches)


## Decision Point

Based on the above factors, the team has decided to go with __Option 3__. Security was the main motivator behind this decision. There is ___no guarantee__ that SSO Tech preview features will released in production. In addition the very definition of __tech preview__ means that these features are not available for support by Redhat. 


