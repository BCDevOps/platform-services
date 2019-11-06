## Documize Admin Usage

Documize is an open source content authoring & automation system that allows teams to collaborate on internal and external documentation. Platform Services team is supporting the Documize instance for the BC Gov community. Follow the settings provided for new space provisioning and maintenance.


## Documentation
- For new users on how to use Documize: https://docs.documize.com/s/WOzFU_MXigAB6sIH/user-guides
- For Admin users: https://docs.documize.com/s/WNEpptWJ9AABRnha/administration-guides


## Technical Details

### Application
- Documize Community Edition v3.3.1
- Conversion Service version 2.7.0
- Postgres & Patroni version 10
- Authentication with RedHat Keycloak 4.8

### Deployment
The application is built and deployed on OpenShift Project Set `hmg6pw-*`. Pipeline is setup with [BCDK](https://github.com/BCDevOps/bcdk).


## Admin Configurations:

### Authentication
Documize has been configured to leverage on RedHat Keycloak and accept GitHub and IDIR identity providers. Instead of hooking up with a realm in KeyCloak, Documize requires full control. Thus, a separate [Keycloak instance](https://sso-doc.pathfinder.gov.bc.ca/) has been setup for direct communication with Documize. In order to use IDIR and GitHub, the new KeyCloak relies on a realm from BCGov Keycloak as its IDP.

### Space Settings:
- space visibility (public/private)
- space label
  - one label per space
  - creating new labels is admin only action
- clone space:
  - template
  - permission (helpful for admin management, the new space owner will need to be updated)


### User Groups/Roles:
- admin group: gives access to all spaces
- new users are only assigned with `active`, space manage/owner needs to login which pre-creates the account
- when a new space is requested, admin user creates it and assign the space manage/owner to an existing account
- space manage/owner is responsible to manage any further access for the space
