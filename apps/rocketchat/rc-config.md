## Rocket Chat Config

Below are the settings in Rocket Chat that we have changed from the default configuration.

### Rooms

* DevOps Alerts
* Random - Default
* DevOps Questions Community
* CSI Lab
* DevOps Platform Team
* Kudos - Default
* DevOps Request


### Custom OAuth

URL: https://sso-dev.pathfinder.gov.bc.ca/auth
Token Path: /realms/devhub/protocol/openid-connect/token
Token Sent Via: Header
Identity Path: /realms/devhub/protocol/openid-connect/userinfo
Authorization Path: /realms/devhub/protocol/openid-connect/auth
Scope: openid
Id: rocket-chat-test
Secret: 63cb2a21-f115-4750-be21-aaa26bb95726
Button Text: Login

### Accounts

* Allow Name Change: False
* Allow Password Change: False
* Show default log in form: False

#### Registration

* Registration Form: Disabled

#### Two Factor Authentication

* Enable Two Factor Authentication: False

### Retention Policy

  Enabled: True
  Applies to channels: True
  Maximum message age in channels: 365
  Applies to private groups: True
  Maximum message age in private groups: 365
  Applies to direct messages: True
  Maximum message age in direct messages: 365
  Only delete files: True

### Permissions 

* Users- Manage Own Integrations: Enabled