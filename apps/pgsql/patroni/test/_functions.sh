#!/bin/bash

function clean_all {
  oc delete all -l app=patroni-001 2> /dev/null
  oc delete pvc,secret,configmap,rolebinding,role -l app=patroni-001 2> /dev/null
}

function remove_bc_triggers {
  jq 'del( .items[] | select (.kind == "BuildConfig") | .spec.triggers )'
}

function check_minishift {
  oc config current-context | grep -q "$(minishift ip)"
}