---
description: This is the Team User Guide for using Sysdig for monitoring the utilization metrics of your containerized application deployments in the BCGov OpenShift platform. 
tags:
- Sysdig
- monitoring
- openshift monitoring
- developer guide
- team guide
title: OpenShift User Guide to Creating and Using a Sysdig Team for Monitoring
---
# Get Started with Sysdig Monitoring

Sysdig Monitor is a SaaS service that provides system level monitoring of Kubernetes hosts. This solution provides the ability to create custom dashboards, alerts, and operational level captures to help diagnose application or platform level issues. 

The Sysdig Teams Operator that is running in the cluster enables a team to create and manage access control to a **dedicated Sysdig Team account** for BC Government OpenShift platform users. The team is scoped specifically to the OpenShift namespaces that belong to a specific team, and also provides a high-level default dashboard to identify system resources, limits, and actual usage.

You can find the overall Sysdig monitoring service described [here](https://developer.gov.bc.ca/BC-Government-Sysdig-Monitoring-Service-Definition).

> Please note that this does not provide a comprehensive overview of the Sysdig Monitor UI or service, however, the **Resources** section below contains links to the Sysdig Monitor User Documentation for more detail.

## Table of Content
* [Step 1 - Login to Sysdig](#step-1---login-to-sysdig)
* [Step 2 - Create Sysdig Team Access](#step-2---create-sysdig-team-access)
  * [Sample sysdig-team object](#sample-sysdig-team-object)
  * [Available Roles](#available-roles)
  * [Creating the Sysdig Team](#creating-the-sysdig-team)
* [Step 3 - Logging Into Your Sysdig Team](#step-3---logging-into-your-sysdig-team)
* [Step 4 - Monitoring Dashboards](#step-4---monitoring-dashboards)
* [Step 5 - Alert Channels](#step-5---alert-channels)
  * [Creating a Rocket.Chat Alert Channel](#creating-a-rocketchat-alert-channel)
      * [Configuring Rocket.Chat](#configuring-rocketchat)
      * [Creating the Sysdig Team Notification Channel](#creating-the-sysdig-team-notification-channel)
* [Step 6 - Advanced Usage](#step-6---advanced-usage)
  * [Creating custom monitoring panels](#creating-custom-monitoring-panels)
  * [Creating a PromQL Based Alert](#creating-a-promql-based-alert)
  * [Leveraging Service Discovery to import Application metrics endpoint](#leveraging-service-discovery-to-import-application-metrics-endpoint)
* [Trouble Shooting](#trouble-shooting)
* [Additional Resources](#additional-resources)

## Step 1 - Login to Sysdig
First thing first, please have you and your team login to Sysdig to create the user account. Our Sysdig uses OpenID Connect, and requires a Github account.

- Navigate to the BCDevOps Sysdig Monitor URL [https://app.sysdigcloud.com/api/oauth/openid/bcdevops](https://app.sysdigcloud.com/api/oauth/openid/bcdevops)
  - Alternatively, navigate to [https://app.sysdigcloud.com](https://app.sysdigcloud.com), select OpenID, and type in `BCDevOps` as the company
- Upon login, you will be presented with a default page. You may be directed to the **Catchall Team** which has access to no resources at the moment (you'll see them after the team access is created in later steps!)
- Find your name initial icon at the bottom left corner. There you can see the email address that represents your account.
  - **Note** that Sysdig identifies users by the email, so it's important to use the correct email addr for yourself as well as your team members

## Step 2 - Create Sysdig Team Access
We are running an OpenShift Operator in the background that creates Sysdig RBAC and dashboard for you. The operator is looking for a `sysdig-team` custom resource from your `*-tools` namespace. The `sysdig-team` resource will:

- Create a Custom Resource in your project *Tools* namespace 
- Create an access control list within the Custom Resource that *identifies users by the ***email address***
  - *Note* all team members will need to login to Sysdig first, the email address can be found by each user from [Sydig User Profile](https://app.sysdigcloud.com/#/settings/user)
  - Only GitHub ID's are currently configured from SSO
- Upon creating the CR, **TWO** teams will be created; 
  - **[license-plate]-team** - All Kubernetes related objects can be monitored here, with the exception of persistent volume claim metrics. 
  - **[license-plate]-team-persistent-storage** - Persistent Volume Claim utilization can be monitored here. 
  - *Note* PVC metrics are now scraped from kubelet services which is not longer available from `kubernetes.*` scope

### Sample sysdig-team object
```yaml
apiVersion: ops.gov.bc.ca/v1alpha1
kind: SysdigTeam
metadata:
  name: 101ed4-sysdigteam
  namespace: 101ed4-tools
spec:
  team:
    description: The Sysdig Team for the Platform Services Documize
    users:
    - name: shelly.han@gov.bc.ca
      role: ROLE_TEAM_MANAGER
    - name: patrick.simonian@gov.bc.ca
      role: ROLE_TEAM_EDIT
    - name: billy.li@gov.bc.ca
      role: ROLE_TEAM_STANDARD
    - name: olena.mitovska@gov.bc.ca
      role: ROLE_TEAM_READ
```

### Available Roles
The following roles are available for use: 
- `ROLE_TEAM_MANAGER (Team Manager, mandatory)` - Can create/edit/delete dashboards, alerts, or other content + ability to add/delete team members or change team member permissions. ***Please note it's mandatory to have at least one team manager, otherwise the operator can't create default templates for you!***
- `ROLE_TEAM_EDIT (Advanced User)` - Can create/edit/delete dashboards, alerts, or other content.
- `ROLE_TEAM_STANDARD (Standard User)` - An Advanced User with no access to the Explore page (e.g. for developers who are not interested in Monitoring information).
- `ROLE_TEAM_READ (View-only User)` - Read access to the environment within team scope, but cannot create, edit, or delete dashboards, alerts, or other content.

**Note** Role Updates should be applied to the CR, and **NOT** in the Sysdig Monitor UI. Reconciliation of the SysdigTeams Operator will overwrite any UI changes to the team roles. 

### Creating the Sysdig Team
- Using `oc apply` with the above example custom resource yaml in your `-tools` namespace, the Sysdig Team will be created by the operator as outlined in the below example; 
  ```shell
  oc project 101ed4-tools
  oc apply -f sysdigteam-sample.yml
  ```
- Validate the creation of the Sysdig Team using `oc describe sysdig-team <your_sysdig_team_cr_name>`
  ```shell
  Name:         101ed4-sysdigteam
  Namespace:    101ed4-tools
  Labels:       <none>
  API Version:  ops.gov.bc.ca/v1alpha1
  Kind:         SysdigTeam
  Metadata:
    Creation Timestamp:  2021-04-15T22:42:20Z
    ...
  Spec:
    Team:
      Description:  The Sysdig Team for the Platform Services Documize
      Users:
        Name:  shelly.han@gov.bc.ca
        Role:  ROLE_TEAM_MANAGER
        Name:  patricksimonian@gmail.com
        Role:  ROLE_TEAM_EDIT
        ...
  Status:
    Conditions:
      Ansible Result:
        Changed:             0
        Completion:          2021-08-18T20:10:43.665524
        Failures:            0
        Ok:                  30
        Skipped:             13
      Last Transition Time:  2021-08-05T18:54:24Z
      Message:               Awaiting next reconciliation
      Reason:                Successful
      Status:                True
      Type:                  Running
  Events:                    <none>

  ```

> When you see `Awaiting next reconciliation` and Successful status, that means the sysdig team has been created successfully. If you do not see `Awaiting next reconciliation`, please contact us on RocketChat channel https://chat.developer.gov.bc.ca/channel/devops-sysdig!

> ***NOTE*** if your project set is on Gold and GoldDR clusters, please only create the sysdig-team Custom Resource in Gold cluster. Our sysdig operator will be able to pick it up and create the dashboards for you apps across the two clusters.

## Step 3 - Logging Into Your Sysdig Team
Now that you've created the custom resource, you can go back to Sysdig again to see the new team scope and default dashboards.
- login to Sysdig like how you did just now
- Navigate to the bottom left hand of the page to switch your team. **You may need to wait some time between the creation of the team and resources to display**

![](assets/sysdigteams_switch.png)



## Step 4 - Monitoring Dashboards
As promised, there are two sysdig teams created
- A simple resource dashboard has been created to provide an overview of limits and requests across all team namespaces
![](assets/sysdigteams_dashboard_nav.png)
![](assets/sysdigteams_resource_overview.png)

- A simple persistent storage dashboard has been created to provide an overview of all Persistent Volume Claim utilization. 
**Note: PVC's must be attached to a running pod for their metrics to be displayed on this dashboard.**
![](assets/sysdigteams_persistent_storage.png)

- A series of pre-defined dashboards exist for general usage or to assist in creating custom dashboards; with a user that has an appropriate permissions
- Navigate to the `Dashboards` Icon, select `Add Dashboard` and select `Create from Template`
![](assets/sysdigteams_add_dashboard.png)
![](assets/sysdigteams_sample_dashboard.png)


> ***NOTE*** we highly recommend teams to use [Sysdig API](https://docs.sysdig.com/en/docs/developer-tools/sysdig-rest-api-conventions/) to keep your cool dashboards as code! Each of the dashboard is assigned to an account on Sysdig for ownership, deleting the user (doesn't matter if it's done from console or custom resource) will delete all of the dashboards. As Sysdig cloud is a Saas not something we run locally, there is no way for us to retain the deleted dashboards for you.

## Step 5 - Alert Channels
Currently Alert Channels can be created manually through the Sysdig Monitor UI. 

### Creating a Rocket.Chat Alert Channel
The following walk through provides a sample for integrating Sysdig Alerts with Rocket.Chat. Both Sysdig Monitor and Rocket.Chat require configurations. 
- Sysdig Monitor will create a **Webhook** notification channel
- Rocket.Chat will create an **incoming webhook** with a custom script


#### Configuring Rocket.Chat
Rocket.Chat requires an Incoming Webhook and a script to parse the data from Sysdig. 
- Create the Incoming Webhook

![](assets/sysdigteams_rocketchat_webhook_config_1.png)
![](assets/sysdigteams_rocketchat_webhook_config_2.png)
![](assets/sysdigteams_rocketchat_webhook_config_3.png)
![](assets/sysdigteams_rocketchat_alert_webhook_config.png)


- Use the following sample script for basic alert message creation
```js
class Script {
  process_incoming_request({ request }) {
    console.log(request.content);

    var date = new Date(request.content.timestamp);
    
    var alertColor = "warning";

    if(request.content.resolved === "true"){ alertColor = "good"; }
    else if (request.content.status === "ACTIVE") { alertColor = "danger"; }
    return {
      content: {
        icon_url: "https://pbs.twimg.com/profile_images/1033062307352338432/AAPSOLRs_400x400.jpg",
        text: "Sysdig Notification",
        attachments: [{
          title: request.content.alert.name,
          pretext: request.content.alert.description,
          title_link: request.content.event.url,
          color: alertColor,
          fields: [
            {
              title: "State",
              value: request.content.state
            },
            {
              title: "Condition",
              value: request.content.condition
            }
          ]
      }]
      }
    };
  }
}
```

#### Creating the Sysdig Team Notification Channel
- When logged into the Sysdig Monitor UI, navigate to your user account and select `Settings`
- Select `Notification Channels` and `Add Notification Channel`, selecting `Webhook` as the type
![](assets/sysdigteams_notification_channel.png)

- Input the webhook URL generated from RocketChat and configure the notification channel
![](assets/sysdigteams_nc_webhook_config.png)

- Select Save and either navigate to the `Alerts` section on the left hand navigation bar, or start adding custom alerts to any of your configured dashboards. 
![](assets/sysdigteams_add_alert_to_panel.png)

- Note that by default, the alert scope (1.b) is set to `everywhere`, which literally means all namespaces from the cluster! So as not to receive hundreds of alerts from other application, make sure you set the scope to your own namespaces. For example, you can use `kubernetes.namespace.name` and pick the ones you need.
![](assets/sysdigteams_sample_alert.png)



## Step 6 - Advanced Usage

### Creating custom monitoring panels
Sysdig scrapes Prometheus metrics, you can create custom queries using PromQL. Here is a great way to start exploring:
![](assets/sysdigteams_promql_explore.png)


### Creating a PromQL Based Alert
Some of the dashboard panels may be leveraging PromQL to display the metrics. PromQL can be used in Alerts as well. The following example shows an alert for the **Persistent Volume Utilization** when hitting 80% full. 

- If you'd like to get a PVC specific metrics, for example get the max percentage of a storage usage: `max(kubelet_volume_stats_used_bytes{agent_tag_cluster="gold",persistentvolumeclaim="<PVC_name>"}) / max(kubelet_volume_stats_capacity_bytes{agent_tag_cluster="gold",persistentvolumeclaim="<PVC_name>"}) * 100`

- Sample PromQL Query: `((avg(kubelet_volume_stats_used_bytes/kubelet_volume_stats_capacity_bytes) by (persistentvolumeclaim)) * 100) >= 80`  
![](assets/sysdigteams_alert_promql_pvc_usage.png)


### Leveraging Service Discovery to import Application metrics endpoint
Sysdig has a lightweight Prometheus server (Promscrape) that can import your application metrics endpoint into sysdig metrics. Take a look [here](https://docs.sysdig.com/en/docs/sysdig-monitor/integrations-for-sysdig-monitor/configure-monitoring-integrations/migrating-from-promscrape-v1-to-v2/#migrate-using-default-configuration) for more information.

To enable Promscrape to find your application metrics, follow the steps:
- make sure the application metrics endpoint is returning Prometheus metrics. To test so, you can expose the service and curl on the URL
- the following annotations need to be added to the application pods
  ```yaml
  prometheus.io/scrape: true
  prometheus.io/port: <metrics_port>
  prometheus.io/path: <metrics_path>
  # the path is usually at /metrics
  ```
  ***Do not*** add the annotations to the pods directly as they are ephemeral. Instead, this should be part of the infrastructure code and added in the templates. For example, if the app is using an OpenShift deployment, the annotation should be added at `deployment.spec.template.metadata.annotations`.
- once the annotations is in place, sysdig will be able to scrape them. You can navigate to Sysdig Explore tab and look for the sysdig metrics there (Sysdig does relabeling of the metrics, so they will appear as native sysdig metrics now instead of coming from promQL Query)


# Trouble Shooting

## I don't see any default dashboards created for my Sysdig team
Here are some things to look into:
1. click on the bottom left initial icon to make sure you have switched to the correct sysdig team scope. By default you'll land on `catchall` which does not contain any default dashboards
1. check on your sysdig account profile and match it to the email address that you have provided on the `sysdig-team custom resource` in tools namespace. If the admin user's email does not match the corresponding user on sysdig, it will not be able to create the dashboards. To fix this, delete the `sysdig-team` from tools namespace, and recreate it. ***Note*** that if you have created custom dashboards already, make sure to import then as code using [Sysdig API](https://docs.sysdig.com/en/docs/developer-tools/sysdig-rest-api-conventions/) first before deleting the CR!


# Additional Resources
- [Sysdig Monitor](https://docs.sysdig.com/en/sysdig-monitor.html)
- [Sysdig Monitor Dashboards](https://docs.sysdig.com/en/dashboards.html)
- [Sysdig Alerts](https://docs.sysdig.com/en/alerts.html)
- [Sysdig Alerts with Kubernetes and PromQL](https://sysdig.com/blog/alerting-kubernetes/)
- [Sysdig Teams Blog](https://sysdig.com/blog/introducing-sysdig-teams/)
- [Sysdig Teams Docs ](https://docs.sysdig.com/en/grouping,-scoping,-and-segmenting-metrics.html#al_UUID-c54169b7-c8f5-4990-6b63-dd2e25b96cce_UUID-3dc7a7aa-2549-23a2-94e2-cee57bdd538f)
- [Sysdig User Management Docs](https://docs.sysdig.com/en/manage-teams-and-roles.html)
- [Sysdig User Roles](https://docs.sysdig.com/en/user-and-team-administration.html)
