#!/bin/bash
rocketurl=$1
user=$2
pass=$3
channelName="general"

userid=$(curl $rocketurl/api/v1/login -d "user=$user&password=$pass" | jq '.data.userId' | tr -d '"')
token=$(curl $rocketurl/api/v1/login -d "user=$user&password=$pass" | jq '.data.authToken' | tr -d '"')

# Create channel:
curl -H "X-Auth-Token: $token" -H "X-User-Id: $userid" -H "Content-type: application/json" $rocketurl/api/v1/channels.create \
    -d '{ "name": "'$channelName'" }'

# get channel id:
channelId=$(curl -H "X-Auth-Token: $token" -H "X-User-Id: $userid" $rocketurl/api/v1/channels.info?roomName=$channelName | jq -r '.channel._id')

# set default channel:
curl -H "X-Auth-Token: $token" -H "X-User-Id: $userid" -H "Content-type: application/json" $rocketurl/api/v1/channels.setDefault \
    -d '{ "roomId": "'$channelId'", "default": true }'

# # Post message:
curl -H "X-Auth-Token: $token" -H "X-User-Id: $userid" -H "Content-type: application/json" \
    -d '{ "channel": "'$channelName'", "text": "@all, we are currently undergoing Production RocketChat maintainence. This is a temporary chat where we communicate with you on the progress. Please note that this instance will be deleted afterwards." }' \
    $rocketurl/api/v1/chat.postMessage

# reference: https://rocket.chat/docs/developer-guides/rest-api/chat/postmessage/
