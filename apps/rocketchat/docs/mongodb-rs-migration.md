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
