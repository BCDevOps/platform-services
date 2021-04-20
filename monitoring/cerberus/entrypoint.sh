#!/bin/sh

# This is to get the cerberus Service Account token
export SA_TOKEN=$(oc serviceaccounts get-token cerberus)
# and then feed into the configuration files that needs it
sed "s/SA_TOKEN/${SA_TOKEN}/g" /tmp/kubeconfig-template > /tmp/kubeconfig
sed "s/SA_TOKEN/${SA_TOKEN}/g" /tmp/cerberus-config-template.yaml > /tmp/cerberus-config.yaml

cerberus_client -c /tmp/cerberus-config.yaml
