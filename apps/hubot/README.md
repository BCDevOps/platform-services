# BCBot

TODO: clarify the delete reminder action because it looks like you should be able to type "make a coffee in 10 minutes" or whatever, which doesn't work.

## Installing on BCGOV Openshift

1. Create a redis deployment from a standard template: `helm install bcbot-redis bitnami/redis -f redis-helm-values.yaml`
1. Create Hubot user on rocket.chat (if one doesn't exist already)
1. Create a secret containing the password of Hubot's rocket.chat account (if one doesn't exist already) with the name "rocketchat-bot-account-password" and the key "BOT_PASSWORD"
1. Use bc.yaml to create a build: `oc process -f bc.yaml --param-file=prod.env --ignore-unknown-parameters | oc apply -f -`
1. Deploy with dc.yaml: `oc process -f dc.yaml --param-file=prod.env --ignore-unknown-parameters | oc apply -f -`

## Quick Start

* Clone the repo
* Make a .env file formatted like this:

```
ROCKETCHAT_URL=https://chat.developer.gov.bc.ca
ROCKETCHAT_USER=testbot
ROCKETCHAT_PASSWORD=xxxxxxxxxxx
ROCKETCHAT_USESSL=true
RESPOND_TO_DM=true
ROCKETCHAT_ROOM=''
HUBOT_LOG_LEVEL_VALUE=info
```
* Run the following command:

`npm run local` 

