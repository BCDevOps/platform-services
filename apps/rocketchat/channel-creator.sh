#!/bin/bash
filename=channels
rocketurl="https://lab-chat.lab.pathfinder.gov.bc.ca/"
user=$1
pass=$2

userid=$(curl $rocketurl/api/v1/login -d "user=$user&password=$pass" | jq '.data.userId' | tr -d '"')
token=$(curl $rocketurl/api/v1/login -d "user=$user&password=$pass" | jq '.data.authToken' | tr -d '"')

while read -r line; do
    channel="$line"
    curl -H "X-Auth-Token: $token" -H "X-User-Id: $userid" -H "Content-type: application/json" $rocketurl/api/v1/channels.create -d '{ "name": "'$channel'" }'
done < "$filename"