# Switching to Patroni (HA PostgreSQL)

## Why?
The Patroni PostgreSQL implementation is highly available and will ensure the SSO service remains active during platform maintenance. 

## Service Naming
It appears that RH SSO embeds the db service name into the configurations at initial build time, so the service name must remain the same when switching db back-ends. To support this, the service definition can be updated with the appropriate selectors for the desired database. 

- Dump command: 
```
sh-4.2$ pwd 
/opt/app-root/src
sh-4.2$ pg_dump -v -C -F t -f keycloak_test_01132017.tar keycloak 
```

- Copy local: 

```
[sheastewart@sheasus restore]$ oc rsync sso-test-postgresql-3-fk7ms:/opt/app-root/src/keycloak_test_01132017.tar .
receiving incremental file list
keycloak_test_01132017.tar

sent 30 bytes  received 1,623,851 bytes  360,862.44 bytes/sec
total size is 1,623,552  speedup is 1.00
[sheastewart@sheasus restore]$ cd ..
```

- Copy remote (into lab):

```
[sheastewart@sheasus ~]$ oc login https://console.lab.pathfinder.gov.bc.ca:8443 --token=
[sheastewart@sheasus ~]$ oc rsync restore/ patroni-persistent-0:/home/postgres/
WARNING: cannot use rsync: rsync not available in container
keycloak_test_01132017.tar
```

- Restore: 
```
[sheastewart@sheasus ~]$ oc rsh patroni-persistent-0
$ bash
postgres@patroni-persistent-0:/home/postgres$ createuser sso 
postgres@patroni-persistent-0:/home/postgres$ createdb keycloak
postgres@patroni-persistent-0:/home/postgres$ pg_restore -v -C -c -e -d postgres -F t  keycloak_test_01132017.tar
```

## DB Migration Failures

- data doesn't appear after restore, need to run through this process again

## Cleanup Scripts
To clean out a persistent cluster: 

```
oc patch statefulset patroni-persistent -p '{"spec": {"replicas": 0 }}'
oc delete pvc -l application=patroni-persistent
oc delete configmap -l application=patroni-persistent
```

- Scale back up

```
oc patch statefulset patroni-persistent -p '{"spec": {"replicas": 3 }}'
```

## Cutover Steps

- Scale down SSO 
- Back up DB
- Scale down DB
- Deploy HA DB
    - Repoint existing service to ha master
- Restore DB
- Scale up SSO

### Safety
- Keep original db deployment and pvc
- Clean up eventually