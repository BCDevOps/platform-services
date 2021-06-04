## Aqua Post Deployment Configuration

This tool is a set of ansible playbooks to automate the post deployment steps needed for aqua to be configured correctly on fresh installs of the service


## Operations

- enable enforcers
- setup oidc
- setup user account for the scanner

## Variables

|name|default|found_in|description|
|---|---|---|---|
|aqua_url| | group_vars | the base url to the aqua instance|
|aqua_sso_url|https://oidc.gov.bc.ca/auth/realms/8gyaubgq| group_vars | sso auth endpoint|
|aqua_admin_password|| env| the administrator password (env is `AQUA_ADMIN_PASSWORD`)|
|aqua_sso_client_secret|| env| the client secret for the aqua sso client (env is `AQUA_SSO_CLIENT_SECRET)`|
|aqua_sso_client|| env|the aqua sso client name (env is `AQUA_SSO_CLIENT`)|
|aqua_scanner_password||env|the password for the aqua scanner user account (env is `AQUA_SCANNER_PASSWORD`)|
|aqua_scanner_username||env|the username for the aqua scanner user account (env is `AQUA_SCANNER_USERNAME`)|
## How to use

TBD 

