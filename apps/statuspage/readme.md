## Deployment
This application stack is fully deployed into OpenShift via Ansible. 

### Sensitive Data
Some sensitive data exists to configure Grafana for: 
  - SSO Configuration
  - Sysdig Datasource and Dashboard Integration

All sensive data is listed as k/v pairs inside a k8s secret that is loaded into the tooling container. These secrets are applied at deployment time. You must manually create this secret in the tooling namespace.

In the tooling namespace, create a secret as follows: 

```shell
CAT <<EOF >grafana_creds
GF_AUTH_OAUTH_CLIENT_ID=[somename]
GF_AUTH_OAUTH_CLIENT_SECRET=[somekey]
GF_AUTH_OAUTH_AUTH_URL=[sso-realm-path]/protocol/openid-connect/token
GF_AUTH_OAUTH_TOKEN_URL=[sso-realm-path]/protocol/openid-connect/token
GF_AUTH_OAUTH_API_URL=[sso-realm-path]/protocol/openid-connect/userinfo
EOF

oc create secret generic grafana-secret \
    --from-file=grafana_creds \
    --type=opaque \
    -n [project-prefix]-tools

```

# Authentication
Users may access these dashboards via SSO.