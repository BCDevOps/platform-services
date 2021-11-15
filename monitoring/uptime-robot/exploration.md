# Uptime Robot Alternatives
This is to track the exploration of platform uptime monitoring tools.


## Requirements:
First of all, we started with a list of user requirements:

***Must have:***

- https and keyword monitors for clusters and shared services
- integration with multiple alerting channels: email, RC webhook, MSTeams, text message
- one status page per scope: openshift platform and shared services, lab clusters, SSO services
- monitor grouping on status page: to separate out clusters and services
- ability to post announcements and updates
- downtime record shows adequate level of detail to indicate the reason (not just a "keyword not found")
- ability to revert monitor history for false positive (refactor outages if the report was false)
- enterprise-level technical support
- ability to modify the layout to match BCGov theme
- ~~ability to create maintenance window for each monitor to pause metric collection during this window~~ Update: we feel that we should accurately report any outages even during maintenance windows and subtract all downtime from the overall error budget for the service that depends on the predefined SLA. For example, for 99.95% ("three and a half nines") which is our SLA for the Silver service and the DevSecOps tools, the allowed downtime is 4.38 hours per year which should absorb all outages including those that are caused by maintenance.


***Optional:***

- API endpoint for bulk management
- rbac for team access
- ability to setup specific host name to status page

## Comparison:

Following at the tools that we have tested:

| Tool | Saas | https and keyword monitors | alert integration | status page | refactor outages | BCGov theme | technical support | downtime details | individual maintenance window | monitors grouping | issue notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| UptimeRobot | y | y | y | y | n | y (header background) | n | n | n | n | (what we are using now) no support from the service at all |
| Freshping | y | y | y | y | n | y ( just an logo) | standard | n (only on internal console and notification) | n | n | no downtime message; can't create announcements |
| uptime.com | y | y (also with transaction monitor) | y | y | only if it's a proven false positive from uptime | y (header and footer) | standard | n (only on internal console and notification) | y |y | status page not standard view, SLA and status are hosted separately |
| Atlassian Statuspage (UK Gov) | y | y | y | y | ? | y | standard | n | n | y | expensive; focuses more on the subscription feature which is a duplicate for us |


Here are the status page setup for comparison (initial trail, the page layouts need more testing!):
- `Uptime Robot`: https://status.developer.gov.bc.ca/
- `uptime.com`: https://uptime.com/s/platform-service-status-page
- `Freshping`: https://statuspage.freshping.io/58398-teststatuspage
- `Atlassian Statuspage`: https://status.cloud.service.gov.uk/
