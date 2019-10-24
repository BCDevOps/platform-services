# Post Installation configuration

### Change default admin account password

- set ARTIFACTORY_ADMIN and ARTIFACTORY_URL and then run the post-install.yaml playbook.

``` bash
export ARTIFACTORY_ADMIN=<new password>
export ARTIFACTORY_URL=https://<ARTIFACTORY_DNS_NAME>
(ARTIFACTORY_URL includes https, but no /artifactory suffix.)
ansible-playbook post-install.yaml
```

Verify that you are able to log into Artifactory web UI using the new password.

## customized configuration steps

Currently these steps have been manually configured.

- Configuration / Artifactory Licences
  - Apply licenses (1 for each node)
- Configuration / General Configuration
  - Server Name: artifactory
  - Custom Base URL: https://artifactory-devops-artifactory.pathfinder.gov.bc.ca/artifactory
- Security / General Security Configuration
  - [ ] Allow Anonymous Access (disable this)
  - [*] Hide Existence of Unauthorized Resources
- Advanced / Maintenance Configuration
  - Storage Quota: [*] Enable Quota Control

### SSO Configuration

Current OAuth design will automatically create an artifactory user when you successfully log into artifactory via keycloak.  Once a user has logged in and has a local artifactory account, the user will need to have repository access provisioned by the individual repository administrators.  No default access is currently defined.

#### Devhub SSO configuration

Create a new client:

- Client ID: artifactory-oauth
- Client Protocol: openid-connect
- Root URL: https://artifactory-devops-artifactory.pathfinder.gov.bc.ca/artifactory

![](../images/sso-add_client_1.png)

Set the following:

- Access Type: confidential
- Implicit Flow Enabled: on
- Web Origins: *

#### Artifactory OAuth configuration

Under *Settings / Security / OAuth SSO Configuration* create a new provider with the following settings:

- Provider Name: SSO-Devhub
- Provider Type: OpenID
- Client ID: artifactory-oauth
- Secret: {{ fromSSOClientCredential }}
- Auth URL: https://sso.pathfinder.gov.bc.ca/auth/realms/devhub/protocol/openid-connect/auth
- API URL: https://sso.pathfinder.gov.bc.ca/auth/realms/devhub/protocol/openid-connect/userinfo
- Token URL: https://sso.pathfinder.gov.bc.ca/auth/realms/devhub/protocol/openid-connect/token

Enable the new provider by checking the following General OAuth options:

- Enable OAuth
- Auto Create Artifactory Users
- Allow Created Users Access To Profile Page
