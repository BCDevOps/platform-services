# Openshift 4 Platform Services Reliability Dashboard with Uptime Robot

Monitoring status page can be found here: https://status.developer.gov.bc.ca/

This is a high level monitoring aiming to provide the community with a sense of our service reliability. Monitored services include the DevOps OpenShift 4 Platform Clusters and the shared services (also knows as Next Gen Security tools). Uptime Robot tracks the history of service uptime and outages for each of the monitored service. In the future, there will be announcements regarding each major service planned downtime and maintenance as well as updates during outages.

The monitoring relies on a combination of the built-in Uptime Robot monitoring functionality as well as custom more sophisticated metrics and checks that the Platform Services Team has added on top of it.

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

We use 1 minute intervals (shortest available from Uptime Robot) to ping availability endpoints set up for each service. Ocassionaly when a service is extremely busy, the response may timeout and 1 min downtime is recorded. However, we feel that this small error is better than setting the ping intervals to a lower frequency (e.g. 5 mins) and getting a 5 min outage window when the response is not returned due to the network issues between the Uptime Robot and the BC Gov network.  

 In order to address the problem of false positives that can occur with high frequency pings, the Platform Services Team will only receive alerts when a service is down for 5 consequtive attempts.  The Platform Services Team uses a suite of monitoring tools in addition to the  Uptime Robot for monitoring such as Sysdig and Naggios which allows us to detect issues early and narrow down the problem to a specific service or a component.

** Cerberus: is a RedHat suggested monitoring tool for OCP cluster general healthiness. For more details, see doc [here](../cerberus/readme.md).

## Alert Integrations

When a service is down for more than 5 minutes, the pre-configured alerts will be fired off. Here are some major types of alerts we are currently using:

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
