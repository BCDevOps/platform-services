#
# Setup blank RC instance for temporary chat service
#

# use test instance: 
oc project e5imao-test

# scale down the app:
oc scale dc rocketchat --replicas=0

# remove the current db and pvc:
oc delete statefulset mongodb
oc get pvc -l name=mongodb
oc delete pvc -l name=mongodb

# once done, bring back the statefulset:
oc process -f apps/rocketchat/template-mongodb.yaml --param-file=apps/rocketchat/tmp.env --ignore-unknown-parameters=true | oc create -f -
oc get pods -l name=mongodb --watch

# once mongo replica set is ready, scale up app:
oc scale dc rocketchat --replicas=1
oc get pods -l app=rocketchat --watch

# create the general channel with community message:
./tmp-rc-channel-creator.sh https://chat-test.pathfinder.gov.bc.ca <admin_username> <admin_password>

# manually config oauth settings (currently a bug with the overwrite settings)
#- start Oauth option called `keycloak`, this will auto populate the keycloak settings
#- reselect the `Redirect` and `Header` options (this is a bug)
#- disable the default login field

# once RC all ready, scale up the app
oc scale dc rocketchat --replicas=3

# switch over the route:
oc -n e5imao-prod delete route rocketchat
oc process -f apps/rocketchat/template-rocketchat-route.yaml --param-file=apps/rocketchat/tmp.env --ignore-unknown-parameters=true | oc create -f -
