# Use Uptime.com API to manage objects
# Reference: https://uptime.com/api/v1/docs/#
# There are very detailed information for each endpoint, you can get sample scripts as well.

# Setup your auth token:
export UPTIME_AUTH_TOKEN=<get_token_from_service>
# Get list of components:
curl -H "Authorization: Token $UPTIME_AUTH_TOKEN" https://uptime.com/api/v1/checks/ > checks.json
curl -H "Authorization: Token $UPTIME_AUTH_TOKEN" https://uptime.com/api/v1/integrations/ > intergrations.json
curl -H "Authorization: Token $UPTIME_AUTH_TOKEN" https://uptime.com/api/v1/contacts/ > contacts.json

# Get pk:
curl -H "Authorization: Token $UPTIME_AUTH_TOKEN" https://uptime.com/api/v1/checks/ | jq '.results[] | .name, .pk'
curl -H "Authorization: Token $UPTIME_AUTH_TOKEN" https://uptime.com/api/v1/contacts/ | jq '.results[] | .name, .pk'


# Create Intergration:
# note: don't need the contact groups here, as it will be added when creating the contact the other way around!
curl -X 'POST' \
  'https://uptime.com/api/v1/integrations/add-webhook/' \
  -H "Authorization: Token $UPTIME_AUTH_TOKEN" \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "name": "RC-channel-webhook-platform-<name>",
  "postback_url": "<rc_webhook>",
  "headers": "contactusers: @rc-user-1 @rc-user-2 @rc-user-3",
  "use_legacy_payload": false
}'

# Create Contact:
curl -X 'POST' \
  'https://uptime.com/api/v1/contacts/' \
  -H "Authorization: Token $UPTIME_AUTH_TOKEN" \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "name": "platform-services-<name>",
  "sms_list": [
  ],
  "email_list": [
    "email-1",
    "email-2",
    "email-3"
  ],
  "phonecall_list": [
  ],
  "integrations": [
    "RC-channel-webhook-platform-<name>"
  ],
  "push_notification_profiles": [
  ]
}'


# Create Checks:
# Note: we are using bulk upload for now! Thus API endpoint is only used when we need to update them.
curl -X 'PATCH' \
  'https://uptime.com/api/v1/checks/<monitor-pk>/add-contact-groups/' \
  -H "Authorization: Token $UPTIME_AUTH_TOKEN" \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "contact_groups": [
    "contact-1",
    "contact-2",
    "contact-3"
  ]
}'
