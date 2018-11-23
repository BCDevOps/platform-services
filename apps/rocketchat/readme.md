## RocketChat

All code related to the deployment and maintenance of a HA rocketchat instance for the BcDevExchange.

## Deployment

Templ

## Design

### Secrets

A secret is created to store credentials for mongoDB with the following information. The mongoDB pods use this information to create the database and replica sets, and the Rocket Chat pods use this information to connect to the DB.

* username
* password
* admin-username
* admin-password
* database
* replica name


### HA Design

### Image Stream

An image stream is created for the Rocket Chat docker image.


### RocketChat Deployment

### MongoDB Stateful Set

#### Storage

### Services 

Three services are utilized for the Rocket Chat application

* The Rocket Chat service on `port 3000` handles traffic to the Rocket Chat NodeJS pods
* The mongoDB service on `port 27017` handles traffic to the monogoDB pods
* The mongoDB-internal service on `port 27017` handles traffic between the mongoDB pods for cluster communication. This service is headless, no clusterIP.