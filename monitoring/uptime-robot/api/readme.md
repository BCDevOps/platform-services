# Uptime Robot Management via API

Monitors and Alert Contacts can be managed directly via [API](https://uptimerobot.com/api/). Here are the basic scripts that would be needed to create/modify them.


## API key:
An API key is needed to make API requests which can be found in the "My Settings" page.
```shell
export UPTIME_API_KEY=<key>
```

## Alert Contacts:
Currently we uses Alert contacts with the following types:
- email: type 2
- SMS: type 8
- Slack integration (works for RocketChat): type 11
- MSTeams: type 20

```shell
# get all alerts:
curl -X POST -H "Cache-Control: no-cache" -H "Content-Type: application/x-www-form-urlencoded" \
-d "api_key=$UPTIME_API_KEY&format=json" \
"https://api.uptimerobot.com/v2/getAlertContacts" > alerts.json

# Create new alert contact:
curl -X POST -H "Cache-Control: no-cache" -H "Content-Type: application/x-www-form-urlencoded" \
-d "api_key=$UPTIME_API_KEY&format=json" \
-d "type=$ALERT_TYPE" \
-d "friendly_name=$ALERT_NAME&value=$ALERT_VALUE" \
"https://api.uptimerobot.com/v2/newAlertContact"

# edit is only available for webhook type of alert

# delete:
curl -X POST -H "Cache-Control: no-cache" -H "Content-Type: application/x-www-form-urlencoded" \
-d "api_key=$UPTIME_API_KEY&format=json" \
-d "id=$ALERT_ID" \
"https://api.uptimerobot.com/v2/deleteAlertContact"
```


## Monitor - Alert settings:
All monitors can be found from [json](./monitors.json). We use the API endpoint to setup the alerts for each monitor.

Each individual alert format: `<alertID>_<threshold>_<recurrence>`
- threshold: when service is down for X minutes
- recurrence: set off alert for every Y minutes (Y=0 will only alert once)
- e.g: alert1=888888_5_0 alert id 888888 will be set off ONCE when service is down for 5 minutes

For multiple alert settings, `ALERT_CONTACTS=<alert>[-<alert>]`

```shell
# get all monitors:
curl -X POST -H "Cache-Control: no-cache" -H "Content-Type: application/x-www-form-urlencoded" \
-d "api_key=$UPTIME_API_KEY&format=json" \
"https://api.uptimerobot.com/v2/getMonitors" > monitors.json

# create new monitor:
curl -X POST -H "Cache-Control: no-cache" -H "Content-Type: application/x-www-form-urlencoded" \
-d "api_key=$UPTIME_API_KEY&format=json" \
-d "type=2" \
-d "url=https://api.golddr.devops.gov.bc.ca:6443/readyz" \
-d "friendly_name=GoldDR Platform Service - Ready" \
-d "interval=60" \
-d "keyword_type=2" \
-d "keyword_value=ok" \
"https://api.uptimerobot.com/v2/newMonitor"

# edit alert contact for specific monitor:
# Sample alert setting
export MONITOR_ID=788817875
export ALERT_CONTACTS=01144261_0_0-3262209_5_0-3263144_5_0-3263719_5_0-3263720_5_0-3263721_5_0-3263722_5_0-3263723_5_0-3263724_5_0-3263725_5_0

curl -X POST -H "Cache-Control: no-cache" -H "Content-Type: application/x-www-form-urlencoded" \
-d "api_key=$UPTIME_API_KEY&format=json" \
-d "id=$MONITOR_ID" \
-d "alert_contacts=$ALERT_CONTACTS" \
"https://api.uptimerobot.com/v2/editMonitor"
```
