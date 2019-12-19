# Setup Guide

## Requirements 
- kubectl 1.14+ (if using customize)
- kustomize binary (you can use more iterations of sed if you prefer)
```shell
curl -s "https://raw.githubusercontent.com/\
kubernetes-sigs/kustomize/master/hack/install_kustomize.sh"  | bash
sudo mv kustomize /usr/bin/kustomize
sudo chmod 777 /usr/bin/kustomize
```

<!-- ```shell
## Doesn't support 0.12
export OCP_PROJECT=devops-platform-security
export FRONTEND_NAME=events-frontend

oc new-project $OCP_PROJECT
helm repo add argo https://argoproj.github.io/argo-helm
helm fetch argo/argo-events
helm template *.tgz \
	--name $FRONTEND_NAME \
	--namespace $OCP_PROJECT \
  --set namespace=$OCP_PROJECT \
  --set sensorController.tag=v0.12-rc \
  --set gatewayController.tag=v0.12-rc \
  > argo_events.yml

oc apply -f argo_events.yml
``` -->
- Edit kustomization.yaml with the name of the project in the `namespace:` field
- Create new project and deploy infrastructure from `security/robomountie`

```
export OCP_PROJECT=rmountie-04

oc new-project $OCP_PROJECT

## If deploying into BCGov Clusters with NetworkSecurityPolicy
## Note: Kustomize doesn't like the way we've formatted the spec, so we will use sed instead. 
sed "s/ocp-project/$OCP_PROJECT/g" manifests/nsp.yml | oc apply -f -

<!-- ## Deploy Argo workflows (IF YOU WANT TO USE THEM)
curl  https://raw.githubusercontent.com/argoproj/argo/master/manifests/namespace-install.yaml -o manifests/argo_workflows.yml
sed -i "s/    namespace: argo/    namespace: $OCP_PROJECT/g" manifests/argo_workflows.yml -->


## Deploy Argo events controllers
curl https://raw.githubusercontent.com/argoproj/argo-events/master/hack/k8s/manifests/installation.yaml -o manifests/argo_events.yml

## Update the configMap variable (singe we don't control this)
sed -i "s/    namespace: argo-events/    namespace: $OCP_PROJECT/g" manifests/argo_events.yml

kubectl kustomize manifests/ | oc apply -f -
```

- Deploy sample sensor, route, and webhook gateway

```shell
oc apply -f manifests/sample/gateway_argo_webhook.yml
oc apply -f manifests/sample/cm_argo_eventsource_webhook.yml
oc apply -f manifests/sample/sensor_argo_webhook.yml
```


### Testing


- Use `curl` to test the endpoint

```shell
$ curl -X POST http://$(oc get route webhook-gateway-service -o template --template '{{.spec.host}}')/example -d '{"message":"this is my first webhook"}'
success 
```

- View the logs from the webhook gateway

```shell

$ oc logs $(oc get po | grep webhook-gateway | awk '{print $1}') -c webhook-events
starting gateway server
INFO[2019-12-16 01:13:02] a request received, processing it...          endpoint=/example event-source=example http-method=POST port=12000
INFO[2019-12-16 01:13:02] dispatching event on route's data channel...  endpoint=/example event-source=example http-method=POST port=12000
INFO[2019-12-16 01:13:02] successfully processed the request            endpoint=/example event-source=example http-method=POST port=12000
INFO[2019-12-16 01:13:02] new event received, dispatching to gateway client  event-source=example

$ oc logs $(oc get po | grep webhook-gateway | awk '{print $1}') -c gateway-client 
INFO[2019-12-16 01:13:02] converting gateway event into cloudevents specification compliant event  event-source=example
INFO[2019-12-16 01:13:02] event has been transformed into cloud event   event-source=example
INFO[2019-12-16 01:13:02] event published successfully                  event-source="webhook-gateway-with-standard-nats:example"

$ oc logs $(oc get po | grep webhook-sensor | awk '{print $1}') 
INFO[2019-12-16 20:29:20] all event dependencies are marked completed, processing triggers 
INFO[2019-12-16 20:29:20] created object                                kind=Pod name=hello-world-xgnp4
INFO[2019-12-16 20:29:20] marking node phase                            node-name=webhook-pod-trigger node-type=Trigger phase=""
INFO[2019-12-16 20:29:20] phase marked as completed                     node-name=webhook-pod-trigger node-type=Trigger
INFO[2019-12-16 20:29:20] marking node phase                            node-name="webhook-gateway-with-standard-nats:example" node-type=EventDependency phase=Complete
INFO[2019-12-16 20:29:20] sensor state updated successfully             phase=Active
INFO[2019-12-16 20:29:20] successfully persisted sensor resource update and created K8s event 
INFO[2019-12-16 20:29:20] sensor resource update                       
INFO[2019-12-16 20:29:20] sensor state updated successfully             phase=Active
INFO[2019-12-16 20:29:20] successfully persisted sensor resource update and created K8s event 

$ oc logs -f $(oc get po | grep hello-world | awk 'NR==1{print $1}')
 _____________ 
< hello-world >
 ------------- 
    \
     \
      \     
                    ##        .            
              ## ## ##       ==            
           ## ## ## ##      ===            
       /""""""""""""""""___/ ===        
  ~~~ {~~ ~~~~ ~~~ ~~~~ ~~ ~ /  ===- ~~~   
       \______ o          __/            
        \    \        __/             
          \____\______/ 
```


## Known Issues
- Wehbook Gateway Reboot
  Sometimes the webhook-gateway pod has needed a restart before it was actually publishing the event to nats. 

- Parameterization doesn't work
  Parameterization doesn't work in 0.12-rc for argo-events; waiting on a fix and ultimately a full payload can be passed through (slated for 0.13)