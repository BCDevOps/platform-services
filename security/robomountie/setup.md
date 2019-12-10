# Setup Guide



```shell
export OCP_PROJECT=devops-platform-security
export FRONTEND_NAME=events-frontend

oc new-project $OCP_PROJECT
helm repo add argo https://argoproj.github.io/argo-helm
helm fetch argo/argo-events
helm template *.tgz \
	--name $FRONTEND_NAME \
	--namespace $OCP_PROJECT \
  > argo_events.yml

oc apply -f argo_events.yml
```

```
export OCP_PROJECT=rmountie-02
export FRONTEND_NAME=events-frontend

oc new-project $OCP_PROJECT
sed "s/ocp-project/$OCP_PROJECT/g" manifests/nsp.yml | oc apply -f -
oc apply -f manifests/cm_argo_eventsource_webhook.yml
oc apply -f manifests/deployment_nats.yml
oc apply -f manifests/gateway_argo_webhook.yml
# oc apply -f manifests/nats_simple.yml
oc apply -f manifests/route_argo_webhook.yml
oc apply -f manifests/sensor_argo_webhook.yml
```