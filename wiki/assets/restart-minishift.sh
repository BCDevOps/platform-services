#!/bin/bash
:<<'END'

Author: Dave Kelsey <David.Kelsey@gov.bc.ca>
  Date: July 15, 2019

Restarting minishift is tedious so I scripted it.


PRECONDITIONS:  

* You are not using windows - I don't have a widows machine to test this on.
* You have already setup minishift and you are simply restarting it.

minishift Installation Instructions:

https://github.com/BCDevOps/platform-services/blob/cvarjao-cdk-minishift/wiki/minishift.md


I want to stress this is a restart script!


NOTES:

* This script will not re-setup Persisten Volumes: I don't believe that to be necessary provided
  you already did so when you initially setup minishift. As the `admin` user run `oc get pv` and you see this is correct.
* Associating a develoepr account so that images can be pulled from the redhat registry assumes you have a developer account and
  that your subscription Pool ID (the value supplied to '--pool')  doesn't change.  Developer accounts are free (https://developer.redhat.com).
  From the following instructions you can find your Pool ID: 

  https://github.com/BCDevOps/platform-services/blob/cvarjao-cdk-minishift/wiki/minishift.md#attach-rhel-subscription-enables-red-hat-software-collections


END

echo "stopping minishift"
minishift stop

echo "starting minishift"
minishift start --openshift-version=3.11.59 --memory=12GB --cpus=8

echo "Setting hostname for docker registry"
minishift ssh -- 'sudo bash -c "echo 172.30.1.1 docker-registry.default.svc >> /etc/hosts"'

echo "whoami?"
oc whoami

echo "authenticate as admin"
oc login -u admin -p system

echo "set REGISTRY_OPENSHIFT_SERVER_ADDR for 'default' project/namespacer"
oc -n default set env dc/docker-registry REGISTRY_OPENSHIFT_SERVER_ADDR=docker-registry.default.svc:5000

echo "authenticate as developer again"
oc login -u developer -p hello

echo "Associate deverloper account - so that image repose can be found"
minishift ssh -- 'sudo subscription-manager refresh && sudo subscription-manager list --available "--matches=Red Hat Developer Subscription" --pool-only | xargs -t -I {} sudo subscription-manager attach "--pool={}"'
