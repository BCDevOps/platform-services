#!/bin/bash

## Login to local cluster
oc login https://kubernetes.default.svc.cluster.local --token=$(cat /var/run/secrets/kubernetes.io/serviceaccount/token) --insecure-skip-tls-verify=true

## Change into proper directory and run uninstall playbook
cd apps/statuspage/ansible
ansible-playbook  -i prod statuspage.yml  -e activity=configure -e env=dev
