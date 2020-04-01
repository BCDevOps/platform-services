# Migrate data between mongo replica sets
As the database grow large, db dump and restore is taking longer time. During a migration, it's recommended to bring down the application so that no chat messages will be lost during the time.

## scale down app
```shell
oc delete horizontalpodautoscaler.autoscaling/rocketchat-hpa
oc scale --replicas=0 dc rocketchat
```

## create new statefulset with the same mongodb secret:
```shell
# this will create a statefulset call mongodb-x
oc process -f ../template-mongodb.yaml --param-file=tmp.env --ignore-unknown-parameters=true | oc create -f -
```

## migrate data with dump and restore
See [doc](../readme.md) section `Restore Backup` for details.


## check for replicas sync up
```shell
mongo admin -u admin -p $MONGODB_ADMIN_PASSWORD
   rs.printSlaveReplicationInfo()

```

## switch the db service to the new statefulset after rs is ready
oc patch the selector of the service


# Update statefulset specs without restart

If the update does not require a statefulset restart, then no downtime is needed. Just bring in new replica with the updated configuration and restart the old ones afterwards.

## Update statefulset spec
1. make a backup of the data first
2. some spec are not mutable for a statefulset, if that's the case, run a migration instead
3. Update statefulset spec
    ```shell
      oc patch statefulset/mongodb -p '{"spec":{"template":{"spec":{"containers":[{"name":"mongo-container","resources":{"limits":{"memory":"5Gi"},"requests":{"memory":"2Gi"}}}]}}}}'
    ```

## Bring up new replica pod with updated spec
```shell
  oc scale statefulset mongodb --replicas=4
```

## Switch over primary and free the old replica pods
1. Wait for data sync up on the new replica pod, and then make primary
    ```shell
    mongo admin -u admin -p $MONGODB_ADMIN_PASSWORD
    # add new replica
      rs.add("mongodb-3.mongodb-internal.<namespace>.svc.cluster.local:27017")
    # check replica status
      rs.printSlaveReplicationInfo()
    # set priority
      rs.reconfig({_id: "rs0", version: 2, members: [
        { _id: 0, host : "mongodb-0.mongodb-internal.<namespace>.svc.cluster.local:27017", priority : 0.5 },
        { _id: 1, host : "mongodb-1.mongodb-internal.<namespace>.svc.cluster.local:27017", priority : 0.5 },
        { _id: 2, host : "mongodb-2.mongodb-internal.<namespace>.svc.cluster.local:27017", priority : 0.5 },
        { _id: 3, host : "mongodb-3.mongodb-internal.<namespace>.svc.cluster.local:27017", priority : 1 }
      ]}, {force:true});
    # stepdown or wait for re-election
      rs.stepDown()
    ```

2. test on application
3. restart all old pods

## Reset replica set back to normal status
1. once all done, reset the priority to 1 for new replicas, and lower the current primary
2. stepDown the primary to another replica
3. once done, delete the new replica pod and pvc
    ```shell
    mongo admin -u admin -p $MONGODB_ADMIN_PASSWORD
    # set priority
      rs.reconfig({_id: "rs0", version: 3, members: [
        { _id: 0, host : "mongodb-0.mongodb-internal.<namespace>.svc.cluster.local:27017", priority : 1 },
        { _id: 1, host : "mongodb-1.mongodb-internal.<namespace>.svc.cluster.local:27017", priority : 1 },
        { _id: 2, host : "mongodb-2.mongodb-internal.<namespace>.svc.cluster.local:27017", priority : 1 },
        { _id: 3, host : "mongodb-3.mongodb-internal.<namespace>.svc.cluster.local:27017", priority : 0.5 }
      ]}, {force:true});
    # check replica status
      rs.printSlaveReplicationInfo()
    # delete new replica
      rs.remove("mongodb-3.mongodb-internal.<namespace>.svc.cluster.local:27017")
    
    # scale down SS
    oc scale statefulset mongodb --replicas=3
    ```
