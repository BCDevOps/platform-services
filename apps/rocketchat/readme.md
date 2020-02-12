# RocketChat

All code related to the deployment and maintenance of a HA Rocket Chat instance for the BcDevExchange.

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

### Images

The Rocket Chat image is pointing at a specific tag on docker hub. The MongoDB image is pointing at the internal MongoDB image that ships with OpenShift using the `latest` tag.

### Storage

A PVC is defined in the template to store file uploads to Rocket Chat. This is a RWX PV so all Rocket Chat pods have read/write access. File retention and upload settings are set to define a max upload size and how long to keep the files around. This PV is not backed up.

Rocket Chat configuration is stored in the Mongo DB so configuration will stay with database backup/restores. 

### Authentication

Local authentication is disabled on Rocket Chat and a custom OAuth configuration is defined that uses the DevHub Keycloak(SSO). The only local account created is the admin account. The local admin account is available as a backup in case of OAuth issues. The password is stored as a secret in the Rocket Chat OCP project.

### MongoDB StatefulSet

MongoDB is set up in a StatefulSet which takes care of deploying the pods and provisioning and connecting storage. The StatefulSet will deploy one pod at a time and configure it's storage before moving to the next. StatefulSets keep pod names when pods get recreated and use PVCs and PVs for data, making sure restarting pods will remain "stateful" and not lose data.

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
* fill in the `Valid Redirect URIs` with the redirect URI valid for current deployment e.g.; `https://chat-<env>.pathfinder.gov.bc.ca/_oauth/keycloak`
* add a role to the client called `rocketchat-users` 
* turn off full scope allowed under `scope`
* group role & flow auth in here...

#### RocketChat Deployment

All of the OpenShift objects are wrapped up in two template files. You can load the templates into OpenShift and deploy the template through the web console `oc create -f template-rocketchat.yaml && oc create -f template-mongodb.yaml`.

All of the template parameters are defined in environment files specific to the environment to deploy Rocket Chat into, dev, test, and prod.

Before you deploy the Rocket Chat/Mongo DB template go through the environment file and update the template parameters values to ones that make sense for your deployment and deploy all the objects:
```shell
# 1. deploy mongo and check if it's up and running:
oc process -f template-mongodb.yaml --param-file=<env>.env --ignore-unknown-parameters=true | oc create -f -

# 2. make sure if the template secret if ready, if not use `template-rocketchat-secret-prep.yaml`

# 3. deploy Rocketchat:
oc process -f template-rocketchat.yaml --param-file=<env>.env --ignore-unknown-parameters=true | oc create -f -

```

A standard DeploymentConfig is created for the Rocket Chat NodeJS application. Environment variables are loaded in from the mongodb secret. Liveness and readiness health checks on HTTP port 3000 are set. The DeploymentConfig is set up for a rolling deployment with 3 replicas

After the Rocket Chat and MongoDB pods are up and running you can connect to the Rocket Chat route and log in with the admin user in pass defined in the config map. The custom OAuth settings are there but you need to manually enable it.

 * Under Administration -> OAuth
 * Add custom oauth -> Enter in "Keycloak", this will auto populate the Keycloak OAuth settings
 * Under the Keycloak setting -> Reselect `Redirect` for the login style (sometime this value doesn't parse properly)
 * Under Administration -> Accounts
 * Set "Show default login form" False (This will make sure only the custom Keycloak oauth is available for log in)

We also need to select pop-up for log in style and auth once, then can change to Redirect option.

#### Add Channels

To batch create channels to start off with filling in `channels` file with channel names you would like.

Run `./channel-creator.sh https://route-to-rocketchat admin-user-name admin-password` to create the channels. 

If you want to make any of these channels default (all users auto added) you can do so from the administration -> rooms page.

#### Pipelines

There is also pipelines that  

##### Deployment Pipeline


#### Backup & restore

Once the MongoDB and Rocket Chat pods are up and running we probably want to backup the rocketdb. Rocket Chat stores all configuration and chat history in the database which makes restoring after a disaster easy.

##### Backup Volume

We'll need some storage that we can dump the database backup to. Using the NFS APB gives us a easy option to get a PVC mapped to our project. This storage lives outside the cluster which is ideal for back up, details: https://github.com/BCDevOps/provision-nfs-apb 

##### Backup CronJob

Once we have a PVC in our project we can deploy the CronJob template that will schedule a job to run at a defined interval that will start a MongoDB pod and run `monogdump` against the MongoDB service and dump the backup files to the PVC.

```
oc process -f mongodb-backup-template.yaml MONGODB_ADMIN_PASSWORD=adminpass MONGODB_BACKUP_VOLUME_CLAIM=nfs-pvc MONGODB_BACKUP_KEEP=7 MONGODB_BACKUP_SCHEDULE='1 0 * * *' | oc create -f -
```

##### Restore Backup

You can deploy new rocketchat/mongo pods using the deployment info above or use an existing rocketchat/mongo deployment to restore a backup into. The pre-req is that there is a mongo db dump directory from a mongodump. If your deploying a new RC deployment it's easiest to deploy the mongo template, restore the db, then deploy the rocket chat template.

1. Scale an existing rocketchat deployment config down to 0. Wait for pods to shutdown and connections to mongo to drop.
    ```
    oc delete horizontalpodautoscaler.autoscaling/rocketchat-hpa
    oc scale --replicas=0 dc rocketchat
    ```
2. Fire up a pod in the same namespaces of the backup pvc and mount that pvc.
    ```shell
    # Setup the ref for mongo that match the existing
    export MONGO_IMAGE_REF=docker-registry.default.svc:5000/openshift/mongodb:3.6

    # Specify the PVC name of nfs backup
    export CLAIM_NAME=bk-xxxxxx

    oc run mongo-restore-pod --overrides=' { "spec": { "containers": [ { "command": [ "/bin/sh", "-c", "for i in $(seq 1 999); do echo $i; sleep 5; done" ], "name": "mongo-restore-pod", "image": "'"${MONGO_IMAGE_REF}"'", "volumeMounts": [{ "mountPath": "/var/data", "name": "data" }] } ],"volumes": [ { "name": "data", "persistentVolumeClaim": { "claimName": "'"${CLAIM_NAME}"'" } } ] } } ' --image=notused --restart=Never 
    ```
3. Pick the backup with timestamp at `/var/data` and copy the restore directory locally.
    ```
    oc rsync mongo-restore-pod:/var/data/dump-2020-02-10-08:01:25/ ./mongo-rocketdb-bak
    ```
4. Copy that directory to the destination mongo pod which may be in a different namespace or cluster.
    ```
    oc -n <new-namespace> rsync ./mongo-rocketdb-bak/ mongodb-0:/tmp/backup
    ```
5. `oc rsh` into the mongo pods.
6. Restore the backup files to the mongo server
    ```shell
    # Use the mongo url available in the mongo pod already:
    mongorestore --uri=$MONGO_OPLOG_URL /tmp/backup --gzip
    
    # The restore process may take a while depending on the size of the backup.
    # Once the restore is done for the local mongodb, restore to the others in the replicaset:
    mongo admin -u admin -p $MONGODB_ADMIN_PASSWORD
    >
    > # get the replica hosts, and replace it in the <replica_host> below export command
    > db.isMaster() 
    > # quit the mongo admin portal
    > quit()

    export MONGO_REPLICA_HOST=<replica_host>
    export MONGO_REPLICA_URL="mongodb://admin:$MONGODB_ADMIN_PASSWORD@$MONGO_REPLICA_HOST/local?authSource=admin&replicaSet=rs0"
    mongorestore --uri=$MONGO_REPLICA_URL /tmp/backup --gzip
    
    ```
7. If the backup is from another KC instance, then you need to update the configmap for RC with values from the original backup. This includes the admin password for RC and other `OVERWRITE_SETTING_` variables.
8. Scale up the rocketchat to test
```
    oc scale --replicas=1 dc rocketchat
```
9. If all good, bring back the `horizontalpodautoscaler` and scale RC app to the expected replica number

## Operations

### Upgrades

Upgrades to Rocket Chat will be handled by deployment of a new image version to the deployment config.

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

### Scaling 

A Horizontal Pod Autoscaler is configured in the template. The Autoscaler is configured to create more pods when the existing pods CPU goes over 80%, to a max of 10 pods. This can be changed in the template before deployment or after the DeploymentConfig is created.

### Handy Commands
Some handy commands for managing & inspecting Rocket Chat & MongoDB.

## Bugs



## Operations
---
Some handy commands for managing & inspecting Rocket Chat & MongoDB.

Connect to the mongodb:

`mongo mongodb://$MONGODB_USER:$MONGODB_PASSWORD@mongodb:27017/local?authSource=admin&replicaSet=rs0`

show collections:

`show collection (tables)`

Query the collection:

`db.rocketchat_uploads.find( {} )`

Get DB stats:

`db.runCommand({ dbStats: 1, scale: 1048576 })`

Get replication set status:

`rs.status()`

## Refrences

* https://github.com/RocketChat/Rocket.Chat/blob/develop/.openshift/rocket-chat-persistent.json
* https://github.com/redhat-cop/pbl-rocketchat/blob/master/mongodb-statefulset-replication.yaml
* https://kubernetes.io/docs/concepts/configuration/assign-pod-node/#affinity-and-anti-affinity
* https://rocket.chat/docs/installation/manual-installation/redhat/Rocket.Chat%20Technical%20Implementation%20Guide%20v.20180316.pdf
* https://rocket.chat/docs/installation/minimum-requirements/
* https://docs.openshift.com/container-platform/3.10/using_images/db_images/mongodb.html#using-mongodb-replication
* https://docs.mongodb.com/manual/core/read-preference/
* https://github.com/appuio/mongodb-backup
