# Artifactory HA on OpenShift

Table of contents
=================

<!--ts-->
   * [Architecture](#architecture)
        * [Artifactory HA Architecture](#Artifactory-HA-Architecture)
        * [Persistent Volumes](#Persistent-Volumes)
        * [External Database](#External-database)
   * [How to deploy on OpenShift](#How-to-deploy-on-OpenShift)
      * [License](#License)
      * [Parameters](#Parameters)
   * [Access Artifactory](#Access-Artifactory)
<!--te-->

## Architecture

### Artifactory HA Architecture

![image alt text](../images/artifactory-diagram.png)

Artifactory supports a High Availability network configuration with a cluster of 2 or more, active/active nodes.

Artifactory "nodes" are configured as a StatefulSet in OpenShift and Kubernetes.

Artifactory HA also requires an external database with a single URL. The external database stores the metadata for the binaries and artifacts which are stored in the internal derby database on the Artifactory nodes.

### Persistent Volumes

Before deploying Artifactory nodes, make sure you have Persistent Volumes (PV) or a Dynamic Provisioner available for the following Persistent Volume Claims (PVC).

| Name | Access Mode | Description |
| ---- | ---- | ---- |
| Artifactory Primary | ReadWriteOnce | Primary node files (application, configuration and logs) |
| Artifactory Member-n | ReadWriteOnce | Primary node files (application, configuration and logs) |

Additional storage is required to store the actual binaries/artifacts.

| Name | Access Mode | Description |
| ---- | ---- | ---- |
| artifactory-data | ReadWriteMany | Shared Data file storage (Binary data) |
| artifactory-backup | ReadWriteMany | Shared backup file storage (Pre-built?) |

Note that 00-artifactory-prereq.yaml and 00-patroni-pgsql.yaml create the necessary PVCs, so you need not make them manually.

Outstanding:
Add an object store for eventual storage of binary data.  This will allow local node storage to be used for staging and caching.  This can be added to the storage chain later.

### External Database

Artifactory HA requires an external database, which is fundamental to management of binaries and is also used to store cluster wide configuration. Currently MySQL, Oracle, MS SQL and PostgreSQL are supported. For details on how to configure any of these databases please refer to [Configuring the Database](https://www.jfrog.com/confluence/display/RTF/Configuring+the+Database). Postgres database for this deployment is [Patroni](https://github.com/BCDevOps/platform-services/tree/master/apps/pgsql/patroni).

Since Artifactory HA contains multiple Artifactory cluster nodes, your database must be powerful enough to service all the nodes in the system.  Moreover, your database must be able to support the maximum number of connections possible from all the Artifactory cluster nodes in your system.

If you are replicating your database you must ensure that at any given point in time all nodes see a consistent view of the database, regardless of which specific database instance they access. Eventual consistency, and write-behind database synchronization are not supported.

# How to deploy on OpenShift

### 1) Have a License

#### License

Artifactory HA will **require** the Enterprise license. Each stateful set pod will require a license.

### 2) Configure the Parameters

#### Parameters

Set parameters for artifactory under artifactory-parameters.env.

*Make sure to set the external database parameters including host and secrets*

| Parameter Name | Description|
| ---- | ---- |
| DATABASE_NAME | Database name which Artifactory will connect to |
| ARTIFACTORY_NAME | Name for Artifactory service and service account |
| ARTIFACTORY_DNS_NAME | DNS Name for the Artifactory route |
| PATRONI_IMAGE_STREAM_TAG | Version for Patroni |
| PATRONI_IMAGE_STREAM_NAMESPACE | Namespace where Patroni image is pulled from |
| ARTIFACTORY_VERSION | Artifactory version |
| ARTIFACTORY_PVC_SIZE | Size of application persistent volume |
| ARTIFACTORY_DATA_PVC_SIZE | Size of persistent volume for shared data storage |
| ARTIFACTORY_BACKUP_PVC_SIZE | Size of PVC to be used for shared backup storage |
| APP_DB_NAME | Name for the database. This must be Artifactory |
| APP_DB_USERNAME | Username for the database. This must be Artifactory |
| PATRONI_PVC_SIZE | Postgresql storage size |
| NUM_OF_MEMBERS | Number of members to be added to the cluster |
| ARTIFACTORY_IMAGE_REGISTRY | Registry where Artifactory image|
| ARTIFACTORY_MASTER_KEY | The Master key is an AES 128 bit secret key that's used by Artifactory to securely synchronize files between cluster nodes. It is responsible to encrypt and decrypt the shared data in the database. |
| ARTIFACTORY_BOOTSTRAP_CREDS | Creds for admin-access |

### 3) Deploy the template

Before Deploying the templates, create your backup pvc target and ensure the ARTIFACTORY_BACKUP_PVC_NAME is set appropriately before continuing. This is done by running the two 00 yaml files.

The following steps will deploy artifactory:

``` bash
# Deploy pre-requisite objects (secrets and storage)
oc process -f 00-artifactory-prereq.yaml --param-file=artifactory-ha.env --ignore-unknown-parameters=true  | oc create -f -
oc process -f 00-patroni-pgsql-prereq.yaml --param-file=artifactory-ha.env --ignore-unknown-parameters=true  | oc create -f -

# Deploy postgresql DB
oc process -f 01-patroni-pgsql.yaml --param-file=artifactory-ha.env --ignore-unknown-parameters=true  | oc apply -f -
# Wait for patroni statefulSet to complete startup before next step.

oc process -f 02-artifactory-ha.yaml --param-file=artifactory-ha.env --ignore-unknown-parameters=true  | oc apply -f -
```

### Access Artifactory

Run `oc get routes`:

```
$ oc get routes
NAME                     HOST/PORT                                                 PATH      SERVICES      PORT      TERMINATION     WILDCARD
artifactory              artifacts.pathfinder.gov.bc.ca             artifactory   http      edge/Redirect   None
```
https://artifacts.pathfinder.gov.bc.ca/

## Post installation configuration

[Artifactory Configuration](config/README.md)
