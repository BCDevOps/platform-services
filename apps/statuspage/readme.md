## Architecture
- [ ] Create arch diagram
- [ ] Create arch documenation note

## Deployment
This application stack is fully deployed into OpenShift via Ansible.

The tools namespace holds a `webhook-ansible` container that is responsible for running the deployment.


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

Add the secret to the webhook-ansible delpoyment for use: 

```shell
oc set volume dc/webhook-ansible --add --type=secret --secret-name=grafana-secret --mount-path=/etc/secrets
```

# Authentication
Users may access these dashboards via SSO.

## Datasources

### Prometheus

### Sysdig

## Dashboards

### Automated Dashboard Creation

### Sysdig Dashboards

#### Updating or Adding Sysdig Dashboards

## Maintenance Notifications