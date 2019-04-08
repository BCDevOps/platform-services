## Purpose
This design pattern illustrates how to lock down access from/to certain pods within a single namespace. 

## Design
In this design pattern, 2 front end application pods and 1 single database pod is deployed with the following names: 
- Front End Application
    - `app-1`
    - `app-2`
- Database
    - `db-1`

OpenShift services are deployed for each application and `curl` is used to validate connectivity to each service port.
For a successful deployment: 
- `app-1` can connect to `db-1`
- `app-2` cannot connect to `db-1`
- any other pod cannot connect o `db-1`

A new app `app-3` will be added once all rules are in place to validate that no changes are required to maintain `app-1 -> db-1` isolation. 


## OpenShift App Deployment

- Deploy application components into single namespace
```
oc project devops-platform-security
oc new-app postgresql-ephemeral --name="db-1" -p DATABASE_SERVICE_NAME="db-1" 
oc new-app nginx-example --name="app-1" -p NAME="app-1"
oc new-app nginx-example --name="app-2" -p NAME="app-2"
```
- Validate all components can communicate freely
```
oc rsh $(oc get pods | grep Running | grep app-1 | awk '{print $1}')
sh-4.2$ curl http://db-1:5432
curl: (52) Empty reply from server
sh-4.2$ curl http://app-2:8080
<!doctype html>
....
....

oc rsh $(oc get pods | grep Running | grep app-2 | awk '{print $1}')
sh-4.2$ curl http://db-1:5432
curl: (52) Empty reply from server
sh-4.2$ curl http://app-1:8080
<!doctype html>
....
....

oc rsh $(oc get pods | grep Running | grep db-1 | awk '{print $1}')
sh-4.2$ curl http://app-2:8080
<!doctype html>
....
....
sh-4.2$ curl http://app-1:8080
<!doctype html>
....
....

```
From the above output, it is clear that each pod can communicate with the desired service and backing pods. 

## Aporeto Configuration



## Todo