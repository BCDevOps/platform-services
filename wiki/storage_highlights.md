---
title: Persistent Storage Services
description: Find helpful documentation regarding persistent storage options supported by the platform. 
---

# Our storage solutions
The platform has several different storage platforms in use as we work to provide an ever-improving storage experience on the platform.  Currently we only have 2 types of storage that we are able to support: FILE and BLOCK storage.

### FILE
File storage is a great all-purpose storage type that can be attached to 1 or more containers, and is the recommended storageClass for most application uses.

### BLOCK
Block storage can offer additional performance and reliability for database or similar workloads, but is only able to be attached to 1 container at a time.

### CLOUD
Cloud Storage is an implementation of an object store that is available via a web based API.  This allows remove access storage over the internet that does not require a method to directly attach to a running system.

## NetApp
The current storage solution for the OpenShift platform is backed by a NetApp appliance that provides both file and block storage to the cluster.

### NetApp File
*netapp-file-standard* is the default storage class for the platform and the type of storage you will get if you do not specify a specific storageClass.

### NetApp Block
*netapp-block-standard* is the current block storageClass target and the storageClass you should use for your block storage needs.

## Gluster (CNS)
The cluster has been using a gluster backed storage solution for the past 2 years to provide on-demand PVC provisioning for teams.  While this storage solution has helped grow our platform and has provided us with a great developer experience, it has reached the end of it's available capacity, and new volume provisioning has been disabled.

This storage is NOT being decommissioned at this time, however it does mean that *new* provisioning will need to be directed to the current storage solution (NetApp), while all existing gluster storage volumes will remain available and supported.

There are 3 CNS storage classes in use:

- gluster-file - All purpose storage
- gluster-file-db - All purpose storage with some tweaks for light DB use
- gluster-block - targeted workload that requires block access to storage.

## Netbackup integrated
This storageClass was created to bridge the gap between in-cluster storage and the BCGov Netbackup infrastructure.  It is currently available as file storage only.  While this solution has provided us with a short term bridge for application backups, there are some caveats for it's use:

- *NOT* highly available storage
- Custom provisioning process (no direct provisioning through creating a PVC)
- Low default quota (for larger quota needs, a discussion and proof of concept implementation are requested before any quota increases are approved)
- Slower performance
- Deprecated for the OpenShift 4 environment.

## Legacy Gluster
Our first storage solution that was manually managed gluster storage.  While this storage was a decent first storage solution, it was not able to provide automatic PVC provisioning, and had higher costs than were sustainable.  This storage class has since been retired and is no longer supported on the platform.
