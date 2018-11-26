## RocketChat

All code related to the deployment and maintenance of a HA rocketchat instance for the BcDevExchange.

![diagram](RocketChat-MongoDB-HA-Design.png)

## Deployment
---

All of the OpenShit objects are wrapped up in a template file you can load the template into OpenShift and deploy that way `oc create -f template-rocketchat-mongodb.yaml`.

You can also edit the tempalte parameters and deploy all the objects: `oc process -f template-rocketchat-mongodb.yaml | oc create -f -`

## Design
--- 
### HA 

High-availability is achieved through 1) the MongoDB replica set up through the OpenShift statefulset and 2) the multiple replicas of the Rocket Chat NodeJS application. The default replicas for these is set to three. This configuration will allow for up to two Rocket Chat and MongoDB pods to fail and the application will still remain up. For increased redundancy the replica count can be set higher. This should only be done if you have more than three app nodes in your OpenShift cluster.

#### Pod Anti-Affinity

!!!Set up anti-affinity rules in template to force pods to different nodes, even if node availability is not available

### Secrets
---
A secret is created to store credentials for mongoDB with the following information. The mongoDB pods use this information to create the database and replica sets, and the Rocket Chat pods use this information to connect to the DB.

* username
* password
* admin-username
* admin-password
* database
* replica name


### Image Stream
---

An ImageStream is created for the Rocket Chat docker image. The Rocket Chat deploymentConfig points to this ImageStream and watches for changes, if an image update is available the application will do a rolling re-deploy. The ImageStream points to the Docker Hub Rocket Chat image.

### RocketChat Deployment
---

A standard DeploymentConfig is created for the Rocket Chat NodeJS application. Environment variables are loaded in from the mongodb secret. Liveness and readiness health checks on HTTP port 3000 are set. The DeploymnetConfig is set up for a rolling deployment with 3 replicas

!!vol mounts empty dir for uploads?

### MongoDB StatefulSet
---

MongoDB is set up in a StatefulSet which takes care of deploying the pods and provisioning and connecting storage. The StatefulSet will deploy one pod at a time and configure it's storage before moving to the next. StatefulSets keep pod names when pods get recreated and use PVCs and PVs for data, making sure restarting pods will remain "stateful" and not loose data.

#### Storage

PVCs are requested for each MongoDB pod to storage database files. The PVCs are set to use the default StorageClass and request RWO access.

### Services 
---

Three services are utilized for the Rocket Chat application

* The Rocket Chat service on `port 3000` handles traffic to the Rocket Chat NodeJS pods
* The mongoDB service on `port 27017` handles traffic to the monogoDB pods
* The mongoDB-internal service on `port 27017` handles traffic between the mongoDB pods for cluster communication. This service is headless, no clusterIP.