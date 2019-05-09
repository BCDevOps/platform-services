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
- `app-1` can only connect to `db-1` and egress internet addresses
- `app-2` cannot connect to `db-1` or any other pod, and only has access to egress internet addresses
- any other pod can only connect to egress internet services unless explicitly configured

A new app `app-3` will be added once all rules are in place to validate that no changes are required to maintain `app-1 -> db-1` isolation. 

## Aporeto Configuration
This will all be automated, the docs are purely for reference until such automation is built.
In this design, while most namespaces will be allow "internal namespace communication", this design pattern requires explicit `allow` policies. 


## OpenShift App Deployment

- Deploy application components into single namespace
```
oc project devops-platform-security
oc new-app postgresql-ephemeral --name="db-1" -p DATABASE_SERVICE_NAME="db-1" 
oc new-app nginx-example --name="app-1" -p NAME="app-1"
oc new-app nginx-example --name="app-2" -p NAME="app-2"
```

## Aporeto Base Namespace Configuration
This default configuration for every namespace will enable pods to commuicate externally, as well as to each other within the namespace :
```
apoctl api import --file manifests/networkpolicy_inter-namespace.yml -n /bcgov-devex/lab/devops-platform-security
```

## Verify that No Pods Can Communicate
- Validate all components can communicate freely
```
oc rsh $(oc get pods | grep Running | grep app-1 | awk '{print $1}')
sh-4.2$ curl http://db-1:5432
...
sh-4.2$ curl http://app-2:8080
...
sh-4.2$ curl www.google.ca
<!doctype html>..

oc rsh $(oc get pods | grep Running | grep app-2 | awk '{print $1}')
sh-4.2$ curl http://db-1:5432
...
sh-4.2$ curl http://app-1:8080
...
sh-4.2$ curl www.google.ca
<!doctype html>..

oc rsh $(oc get pods | grep Running | grep db-1 | awk '{print $1}')
sh-4.2$ curl http://app-2:8080
...
sh-4.2$ curl http://app-1:8080
...
sh-4.2$ curl www.google.ca
<!doctype html>..

```

From the above output, it is clear that each pod can not communicate with any other pod. They do, however, have egress internet access.  

## Aporeto APP-1 to DB-1 Allow
Apply the following policy to all traffic from `app-1` pod to `db-1`:
```
apoctl api import --file manifests/networkpolicy_allow_app-1_to_db-1.yml -n /bcgov-devex/lab/devops-platform-security
```




## Deploy APP-3 and Validate It Cannot Access DB-1
- Deploy `app-3`
```
oc new-app nginx-example --name="app-3" -p NAME="app-3"
sh-4.2$ curl http://db-1:5432
...
```


## Todo