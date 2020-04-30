:warning: This documentation is still a WIP

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

## Authentication
Users may access these dashboards via SSO.

## Datasources
This configuration uses two primary datasources, Prometheus and Sysdig. 

### Prometheus
Promethus is used to store timeseries data regarding endpoint availability as reported by the blackbox exporter. 

### Sysdig
Sysdig collects a vast amount of metrics from the cluster, which is stored inthe SaaS offering. The Sysdig datasource is configured to pull from the `public` Sysdig team which is intended to store dashboards for general consumption. 

## Dashboards
Dashboards in this instance are available to all authenticated users, providing `view-only` access. 2 primary dashboards exist: 
- An automated dashboard that reports the up/down status of various components
- An overall high-level cluster capacity dashboard based on the Sysdig Datasource. 

### Automated Dashboard Creation
[Grafyaml](https://docs.openstack.org/infra/grafyaml/) is used to dynamically build a Grafana dashboard based on the `url_watchlist.yml` file. Ansible reads in the file contents and creates an appropriate grafyaml formatted file for the binary to generate a dashboard. 

:warning: The grafyaml development version is being used and the binary is included in this repo, as the master branch didn't support a few features required for this dashboard. Future releases of Grafana are focusing on more templating capabilities which may eventually replace this function. 

### Sysdig Dashboards
A single Sysdig-based dashboard exists that provides the overall cluster capacity and utilization. This dashboard is managed in the Sysdig SaaS offering, and presented to logged in users within Grafana. This configuration helps restrict access to namespace or host specific metric data. 

#### Updating or Adding Sysdig Dashboards
The recommended path towards updating the Sysdig based dashboard would be: 
- Update / create a dashboard in the Sysdig `public` team
- Log in as an admin to the grafana dev instance of this tool
- Import the new dashboard from the Sysdig datasource configuration page
- Modify the dashboard as required (ie. change names, colors, etc.)
- Export the new dashboard as json
- Update or add the json dashboard code to the `manifests/templates/template-grafana-dashboard-configmap.yml.j2` file
- Commit the change and create the PR, which will trigger an application deployment

## Maintenance Notifications
Maintenance nofitications are automatically posted in the status page dashboard as part of the Automatic Dashboard creation process. 
New notices will also trigger an application deployment, with the following workflow: 
- A notification is posted in the [BCDevOps/platform-services-status-page-notifications](https://github.com/BCDevOps/platform-services-status-page-notifications) repo, and a PR is created
- The PR will trigger the `update_notifications.sh` script from within `ansible-webhook` pod in the `-tools` namespace
- This ansible playbook will run with the `configure` activity specified
- A new dashboard will be generated, and the maintence notification will be posted to rocket chat once the prod environment has been reconfigured