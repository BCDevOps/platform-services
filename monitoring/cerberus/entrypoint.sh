#!/bin/sh

# This is to get the cerberus Service Account token
export SA_TOKEN=$(oc serviceaccounts get-token cerberus)
# and then feed into the configuration files that needs it
sed "s/SA_TOKEN/${SA_TOKEN}/g" /tmp/kubeconfig-template > /tmp/kubeconfig-tmp
sed "s/SA_TOKEN/${SA_TOKEN}/g" /tmp/cerberus-config-template.yaml > /tmp/cerberus-config.yaml

# insert CA cert:
export CA_CERT=$(cat /var/run/secrets/kubernetes.io/serviceaccount/ca.crt | base64 -i - | sed -z 's/\n//g' -)
sed "s/CA_CERT/${CA_CERT}/" /tmp/kubeconfig-tmp > /tmp/kubeconfig

python3 start_cerberus.py --config=/tmp/cerberus-config.yaml
