#!/bin/bash
# sample:
#./rc-api.sh <app_url> <admin_username> <admin_password>
set -e
if [ "$1" == "" ]; then
    echo "Error: Missing Arguments"
    echo ''
    echo "Usage:"
    echo "$0 app-url '<admin_username>' '<admin_password>'"
    echo ''
    echo "e.g.:$0 'https://chat.pathfinder.gov.bc.ca' admin password"
    echo ''
    exit 1
fi

filename=channels
rocketurl=$1
user=$2
pass=$3

userid=$(curl $rocketurl/api/v1/login -d "user=$user&password=$pass" | jq '.data.userId' | tr -d '"')
token=$(curl $rocketurl/api/v1/login -d "user=$user&password=$pass" | jq '.data.authToken' | tr -d '"')

# ------ Create channel: ------
while read -r line; do
    channel="$line"
    curl -H "X-Auth-Token: $token" -H "X-User-Id: $userid" -H "Content-type: application/json" $rocketurl/api/v1/channels.create -d '{ "name": "'$channel'" }'
done < "$filename"

# ------ curl example ------
# curl -H "X-Auth-Token: 9HqLlyZOugoStsXCUfD_0YdwnNXXXXX" \
#     -H "X-User-Id: aobEdbYXXXXXX" \
#     -H "Content-type:application/json" \
#     http://localhost:3000/api/v1/permissions.update \
#     -d '{"permissions": [{"_id": "manage-own-integrations", "roles": ["admin","bot","user"]}]}'

# ------ Get all webhooks: ------
curl -H "X-Auth-Token: $token" -H "X-User-Id: $userid" -H "Content-type: application/json" $rocketurl/api/v1/integrations.list?count=5000 | jq -r ".integrations[] | .channel, ._id"

# ------ Delete webhooks: ------
curl -H "X-Auth-Token: $token" -H "X-User-Id: $userid" -H "Content-type: application/json" $rocketurl/api/v1/integrations.remove \
     -d '{ "type": "webhook-incoming", "integrationId": "dFR6vJo4QW7Dfu6yb" }'

# ------ Get user info: ------
curl -H "X-Auth-Token: $token" -H "X-User-Id: $userid" -H "Content-type: application/json" $rocketurl/api/v1/users.info?userId=2LsyDDjDLj8nFvMaY
curl -H "X-Auth-Token: $token" -H "X-User-Id: $userid" -H "Content-type: application/json" $rocketurl/api/v1/users.info?username=admin

# ------ Get user auth token: ------
curl -H "X-Auth-Token: $token" -H "X-User-Id: $userid" -H "Content-type: application/json" $rocketurl/api/v1/users.generatePersonalAccessToken \
     -d '{ "tokenName": "devhub" }'

# ------ Get rooms and users: ------
curl -H "X-Auth-Token: $token" -H "X-User-Id: $userid" -H "Content-type: application/json" $rocketurl/api/v1/channels.list?count=5000 | jq -r ".channels[] | ._id" > channels.txt
curl -H "X-Auth-Token: $token" -H "X-User-Id: $userid" -H "Content-type: application/json" $rocketurl/api/v1/groups.listAll?count=5000
curl -H "X-Auth-Token: $token" -H "X-User-Id: $userid" -H "Content-type: application/json" $rocketurl/api/v1/users.list?count=5000 | jq -r ".users[] | ._id" > users.txt

while read -r line; do
    channel="$line"
    echo $channel
    curl -H "X-Auth-Token: $token" -H "X-User-Id: $userid" -H "Content-type: application/json" $rocketurl/api/v1/channels.messages?roomId=$channel
done < channels.txt

while read -r line; do
    user="$line"
    echo $user
    curl -H "X-Auth-Token: $token" -H "X-User-Id: $userid" -H "Content-type: application/json" $rocketurl/api/v1/users.info?userId=$user
done < users.txt

# ------ Get chats from a channel: ------
curl -H "X-Auth-Token: $token" -H "X-User-Id: $userid" -H "Content-type: application/json" $rocketurl/api/v1/channels.messages?roomId=HfFxBfikEcpnivv4Q
