# Migrate data between mongo replica sets

## scale down app
```shell
oc delete horizontalpodautoscaler.autoscaling/rocketchat-hpa
oc scale --replicas=0 dc rocketchat
```

## create new statefulset with the same mongodb secret:
```shell
# this will create a statefulset call mongodb-x
oc process -f template-mongodb.yaml --param-file=tmp.env --ignore-unknown-parameters=true | oc create -f -
```

## migrate data with dump and restore

## switch the db service to the new statefulset
