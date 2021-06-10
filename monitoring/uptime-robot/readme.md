# Openshift 4 Platform Services Reliability Dashboard with Uptime Robot

Monitoring status page can be found here: https://status.developer.gov.bc.ca/

This is a high level monitoring aiming to provide the community with a sense of our service reliability. Monitored services include the DevOps OpenShift 4 Platform Clusters and the shared services (also knows as Next Gen Security tools). Uptime Robot tracks the history of service uptime and outages for each of the monitored service. In the future, there will be announcements regarding each major service planned downtime and maintenance as well as updates during outages.

Please also note that in addition to Uptime Robot monitoring, there are more sophisticated metrics and checks that the team is using for each individual shared services and OCP clusters.

## Monitors and Alerts

| Monitor | Endpoint | Monitoring Interval | Alerts |
| ------- |--------- | ------------------- | ------ |
| Gold / Silver Cluster | readyz & Cerberus** | 1 min | RC / MSTeams / SMS / Email |
| Klab / Clab / ARO Cluster | readyz & Cerberus** | 1 min | RC |
| SSO (prod/test/dev) | service URL | 1 min | RC |
| RocketChat | service URL | 1 min | RC / MSTeams |
| Artifactory | service API ping | 1 min | RC |
| Aqua | api URL | 1 min | RC |
| Vault | TBD | TBD | TBD |

***Please note*** that 1 minute interval (shortest available from Uptime Robot) sometime is considered a bit frequent for busy services. But for statistic purpose, we'd like to keep is as short as possible to not mistakenly record each brief downtime including the long wait time util next monitoring round. To address this problem, with a 1 minute interval, we will only receive alerts when service is down for 5 minutes. This is okay as Platform Services Team is not replying solely on Uptime Robot for monitoring. At the time when team gets notified from Uptime Robot, there would be other monitoring mechanism triggered already, such as Sysdig dashboards and alerts.

** Cerberus: is a RedHat suggested monitoring tool for OCP cluster general healthiness. For more details, see doc [here](../cerberus/readme.md).

## Alert Integrations

When a service is down for more than 5 minutes, the preset alerts will be fire off. Here are some major types of alert we are currently using:

**1. RocketChat and MSTeams:**
- webhook setup in a notification channel
- service lead is tagged from the message
- MSTeams used as a backup strategy when RC is affected by cluster wide issue

**2. SMS:**
- text message send to service lead for immediate response

**3. Email:**
- for cluster downtime alerts
- ***Note:*** team should create a custom Uptime Robot announcement after cluster issue being resolved. See next section for details.


## Announcements

There are different types of announcements you will see from Uptime Robot:

**1. Automatic Announcement:**
- whenever there is a downtime detected by Uptime Robot, it will auto generate an announcement with the timestamp and duration
- there is no much details included in this

**2. Custom Announcement:**
- this will be created by a team member with some messages explaining what has happen during a previous major outage
- for any persistent messages for the community, an custom announcement will be pinned at the top of the status page

**3. Maintenance Window:**
- when there is a scheduled maintenance, details can be provided in a Maintenance Window message and the uptime statistic of the service will not be affected during those time


## Monitoring Config as Code
We will be using the [Uptime Robot API](https://uptimerobot.com/api/) endpoint to manage the monitors and alerts.
