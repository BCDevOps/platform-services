#!/bin/bash
filename=channels
rocketurl=$1
user=$2
pass=$3

userid=$(curl $rocketurl/api/v1/login -d "user=$user&password=$pass" | ./jq '.data.userId' | tr -d '"')
token=$(curl $rocketurl/api/v1/login -d "user=$user&password=$pass" | ./jq '.data.authToken' | tr -d '"')

while read -r line; do
    channel="$line"
    curl -H "X-Auth-Token: $token" -H "X-User-Id: $userid" -H "Content-type: application/json" $rocketurl/api/v1/channels.create -d '{ "name": "'$channel'" }'
done < "$filename"

#curl example
#curl -H "X-Auth-Token: 9HqLlyZOugoStsXCUfD_0YdwnNXXXXX" \
#     -H "X-User-Id: aobEdbYXXXXXX" \
#     -H "Content-type:application/json" \
#     http://localhost:3000/api/v1/permissions.update \
#     -d '{"permissions": [{"_id": "manage-own-integrations", "roles": ["admin","bot","user"]}]}'