# RocketChat

All code related to the deployment and maintenance of a HA rocketchat instance for the BcDevExchange.

![diagram](RocketChat-MongoDB-HA-Design.png)

## Design
 
### HA

High-availability is achieved through __1)__ the MongoDB replica set up through the OpenShift statefulset and __2)__ the multiple replicas of the Rocket Chat NodeJS application. The default replicas for these is set to three. This configuration will allow for up to two Rocket Chat and MongoDB pods to fail and the application will still remain up. For increased redundancy the replica count can be set higher. This should only be done if you have more than three app nodes in your OpenShift cluster.

#### Pod Anti-Affinity

Both the MongoDB and the Rocket Chat application pods have anti-affinity require rules set. This will make sure pods get scheduled onto nodes where an existing pod of that application DOES NOT exist. Deployment of multiple pods will fail if this requirement is not met.

### Secrets

A secret is created to store credentials for mongoDB with the following information. The mongoDB pods use this information to create the database and replica sets, and the Rocket Chat pods use this information to connect to the DB.

* username
* password
* admin-username
* admin-password
* database
* replica name

### Image Stream

An ImageStream is created for the Rocket Chat docker image. The Rocket Chat deploymentConfig points to this ImageStream and watches for changes, if an image update is available the application will do a rolling re-deploy. The ImageStream points to the Docker Hub Rocket Chat image.

### Storage

A PVC is defined in the template to store file uploads to Rocket Chat. This is a RWX PV so all Rocket Chat pods have read/write access. File retention and upload settings are set to define a max upload size and how long to keep the files around. This PV is not backed up.

Rocket Chat configuration is stored in the Mongo DB so configuration will stay with database backup/restores. 

### Authentication

Local authentication is disabled on Rocket Chat and a custom OAuth configuration is defined that uses the DevHub Keycloak(SSO). The only local account created is the admin account. The local admin account is available as a backup in case of OAuth issues. The password is stored as a secret in the Rocket Chat OCP project.

### MongoDB StatefulSet

MongoDB is set up in a StatefulSet which takes care of deploying the pods and provisioning and connecting storage. The StatefulSet will deploy one pod at a time and configure it's storage before moving to the next. StatefulSets keep pod names when pods get recreated and use PVCs and PVs for data, making sure restarting pods will remain "stateful" and not loose data.

#### DB Storage

PVCs are requested for each MongoDB pod to storage database files. The PVCs are set to use the StorageClass defined in with the parameter in the template and request RWO access.

### Services 

Three services are utilized for the Rocket Chat application

* The Rocket Chat service on `port 3000` handles traffic to the Rocket Chat NodeJS pods
* The mongoDB service on `port 27017` handles traffic to the monogoDB pods
* The mongoDB-internal service on `port 27017` handles traffic between the mongoDB pods for cluster communication. This service is headless, no clusterIP.

### Deployment
---

#### RH-SSO Setup

We will need to create a client in RH-SSO (KeyCloak) to allow Rocket Chat to authenticate to it.

* create a new client in the RH-SSO admin console, call it rocketchat, leave defaults
* fill in the `Valid Redirect URIs` with the redirt URI valid for current deployment e.g.; `https://chat-test.pathfinder.gov.bc.ca/_oauth/keycloak`
* fill in the `Web Origins` with the redirt URI valid for current deployment e.g.; `https://chat-test.pathfinder.gov.bc.ca/_oauth/keycloak`
* add a role to the client called `rocketchat-users` 
* turn off full scope allowed under `scope`
* group role & flow auth in here...

#### RocketChat Deployment

All of the OpenShit objects are wrapped up in a template file you can load the template into OpenShift and deploy the template through the web console `oc create -f template-rocketchat-mongodb.yaml`.

You can also edit the template parameters and deploy all the objects: `oc process -f template-rocketchat-mongodb.yaml | oc create -f -`

Before you deploy the Rocket Chat/Mongo DB template go through the file (`template-rocketchat-mongodb.yaml`) and update the template parameters and configmap values to ones that make sense for your deployment.

A standard DeploymentConfig is created for the Rocket Chat NodeJS application. Environment variables are loaded in from the mongodb secret. Liveness and readiness health checks on HTTP port 3000 are set. The DeploymentConfig is set up for a rolling deployment with 3 replicas

After the Rocket Chat and MongoDB pods are up and running you can connect to the Rocket Chat route and log in with the admin user in pass defined in the config map. The custom OAuth settings are there but you need to manually enable it.

 * Under Administration -> OAuth
 * Add custom oauth -> Enter in "Keycloak"
 * Under Administration -> Accounts
 * Set "Show default login form" False (This will make sure only the custom Keycloak oauth is available for log in)

#### Add Channels

To batch create channels to start off with fill in `channels` file with channel names you would like.

Update `./channel-creator.sh` with the route to rocket chat. Run `./channel-creator.sh admin-user-name admin-password` to create the channels. 

If you want to make any of these channels default (all users auto added) you can do so from the administration -> rooms page.

## Operations

### Upgrades

Upgrades to Rocket Chat will be handled by deployment of a new image version.

!! testing image change trigger with image stream

### Backup & restore

Once the MongoDB and Rocket Chat pods are up and running we probably want to backup the rocketdb. Rocket Chat stores all configuration and chat history in the database which makes restoring after a disaster easy.

#### Backup Volume

We'll need some storage that we can dump the database backup to. Using the NFS APB gives us a easy option to get a PVC mapped to our project. This storage lives outside the cluster which is ideal for back up, details: https://github.com/BCDevOps/provision-nfs-apb 

#### Backup CronJob

Once we have a PVC in our project we can deploy the CronJob template that will schedule a job to run at a defined interval that will start a MongoDB pod and run `monogdump` against the MongoDB service and dump the backup files to the PVC.

```
oc process -f mongodb-backup-template.yaml MONGODB_ADMIN_PASSWORD=adminpass MONGODB_BACKUP_VOLUME_CLAIM=nfs-pvc MONGODB_BACKUP_KEEP=7 MONGODB_BACKUP_SCHEDULE='1 0 * * *' | oc create -f -
```

#### Restore Backup

To restore the database you will have to start another mongodb instance, then copy or mount the backup files to this instance and issue this restore command.

```
mongorestore -u admin -p \$MONGODB_ADMIN_PASSWORD --authenticationDatabase admin --gzip $DIR/DB_TO_RESTORE -d DB_TO_RESTORE_INTO"
```

### Load Testing

- how many resources are required by the project
- how should data be protected
- whats the expected behavior when nodes are patched, has this been tested (ie. rolling availability)

### Scaling 

A Horizontal Pod Autoscaler is configured in the template. The Autoscaler is configured to create more pods when the existing pods CPU goes over 80%, to a max of 10 pods. This can be changed in the template before deployment or after the DeploymentConfig is created.

### Handy Commands
Some handy commands for managing & inspecting Rocket Chat & MongoDB.

Connect to the mongodb:

`mongo mongodb://$MONGODB_USER:$MONGODB_PASSWORD@mongodb:27017/rocketdb?replicaSet=rs0`

show collections:

`show collection (tables)`

Query the collection:

`db.rocketchat_uploads.find( {} )`

Get DB stats:

`db.runCommand({ dbStats: 1, scale: 1048576 })`

## Refrences

* https://github.com/RocketChat/Rocket.Chat/blob/develop/.openshift/rocket-chat-persistent.json
* https://github.com/redhat-cop/pbl-rocketchat/blob/master/mongodb-statefulset-replication.yaml
* https://kubernetes.io/docs/concepts/configuration/assign-pod-node/#affinity-and-anti-affinity
* https://rocket.chat/docs/installation/manual-installation/redhat/Rocket.Chat%20Technical%20Implementation%20Guide%20v.20180316.pdf
* https://rocket.chat/docs/installation/minimum-requirements/
* https://docs.openshift.com/container-platform/3.10/using_images/db_images/mongodb.html#using-mongodb-replication
* https://docs.mongodb.com/manual/core/read-preference/
* https://github.com/appuio/mongodb-backup


## FOR REVIEW

* Max autoscale pods?
* Memory request & limit?
* CPU request & limit?
* mongo image to use? Using internal image
* docker image to use? dockerhub or RH?
