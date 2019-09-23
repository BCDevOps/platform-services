@echo off
echo This is a companion script for Windows developers and it follows the Minishift instructions 
echo on https://github.com/BCDevOps/platform-services/blob/cvarjao-cdk-minishift/wiki/minishift.md.
pause
echo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
echo THIS WILL DELETE YOUR MINISHIFT VM AND RECREATE IT
echo Make sure you customize this script before running it.
echo This script assumes Virtual Box but you can change it for HyperV.
echo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
pause
echo Pre-requistes:
echo Make sure you are running as admin
echo Minishift must be run from the C drive and the minishift VM should also 
echo be placed on the C drive.
echo Make sure your CMD prompt is on the C drive.
echo Put this file, patch-pvcs.ps1, minishift-storage-class.yaml in a folder on C drive.

echo Set system variable MINISHIFT_PASSWORD = RedHat password
echo Set system variable MINISHIFT_USERNAME = RedHat subscription username.
echo Note: Redhat subscription username is NOT your email id. Check it online under your subscription.

echo Make sure there is no SSH path in the PATH variable. Minishift will fail if 
echo your PATH contains the SSH path for WSL in the system folder. You don't 
echo need to uninstall WSL, but SSH path has to go. 
echo To-do: Find what SSH software minishift can use other than its own.

echo Download CDK from https://developers.redhat.com/products/cdk/download and 
echo rename it to minishift.exe. Add this location to the PATH variable.

echo Install Oracle VM virtualbox https://www.virtualbox.org/wiki/Downloads

echo Install Go https://golang.org/dl/. Add this location to the PATH variable.
echo Copy zoneinfo.zip from c:\Go\lib\time into c:\usr\lib\golang\lib\time\

echo Install Jq https://stedolan.github.io/jq/download/. Add this location to the PATH variable.
echo **************************************************************************************
echo PRESS ENTER TO CONTINUE OR CTRL + C TO EXIT
echo Stopping any old minishift instance
pause
minishift stop

echo **************************************************************************************
echo Deleting any old minishift instance
pause
minishift delete --clear-cache
rmdir /s /q C:\Users\%username%\.minishift
rmdir /s /q C:\Users\%username%\.kube

echo **************************************************************************************
echo Setup minishift
pause
minishift setup-cdk --force
minishift addons enable registry-route
minishift addons disable anyuid
minishift config set vm-driver virtualbox
minishift config get vm-driver

echo **************************************************************************************
echo Start minishift
pause
minishift start --openshift-version=3.11.59 --memory=6GB --cpus=2 --disk-size=40GB --show-libmachine-logs --v=5

echo **************************************************************************************
echo Print minishift, oc and openshift versions
pause
minishift version
oc version
minishift openshift version

echo **************************************************************************************
echo Login as admin and setup policy
pause
oc login -u admin -p system
oc adm policy add-scc-to-group hostmount-anyuid system:serviceaccounts

echo **************************************************************************************
echo Setting timezone for minishift. If not already done it will copy zoneinfo.zip is in c:\usr\lib\golang\lib\time\.
pause
if not exist c:\usr\lib\golang\lib\time\ (mkdir c:\usr\lib\golang\lib\time\)
copy c:\Go\lib\time\zoneinfo.zip c:\usr\lib\golang\lib\time\ /Y
minishift timezone --set "America/Vancouver"

echo **************************************************************************************
echo Add hosts file for the docker registry.
pause
minishift ssh -- "sudo bash -c ""echo 172.30.1.1 docker-registry.default.svc ^>^> /etc/hosts"""

echo **************************************************************************************
echo set Docker registry environment
pause
oc -n default set env dc/docker-registry REGISTRY_OPENSHIFT_SERVER_ADDR=docker-registry.default.svc:5000

echo **************************************************************************************
echo About to setup Redhat subscription
pause
minishift ssh -- sudo subscription-manager refresh
minishift ssh -- sudo subscription-manager list --available
echo In the next command, you need to enter the pool id from the output of the previous command.
echo Todo: extract the pool id automatically.
set /P PoolID=Pool ID (from the previous command):
minishift ssh -- sudo subscription-manager attach --pool=%PoolID%
minishift ssh -- sudo subscription-manager repos --list | findstr "scl"
echo The previous command should have found rhel-server-rhscl-7-rpms and now we enable it. 
minishift ssh -- sudo subscription-manager repos --enable=rhel-server-rhscl-7-rpms

echo **************************************************************************************
echo Setting up shared namespaces/resources
pause
oc new-project bcgov
oc new-project bcgov-tools
oc policy add-role-to-group system:image-puller 'system:serviceaccounts:bcgov' -n bcgov-tools --rolebinding-name='cross-project-image-pull'
oc policy add-role-to-group system:image-puller 'system:serviceaccounts' -n bcgov --rolebinding-name='any-project-image-pull'

echo **************************************************************************************
echo Import shared images from Pathfinder Openshift
echo Create a secret using the username/token from https://console.pathfinder.gov.bc.ca:8443/console/command-line
pause
set /P DockerUserID=Enter Docker User ID (Pathfinder userid):
set /P DockerPassword=Enter Docker Password (Pathfinder token):
oc -n bcgov create secret docker-registry pathfinder --docker-server=docker-registry.pathfinder.gov.bc.ca --docker-username=%DockerUserID% --docker-password=%DockerPassword%

echo **************************************************************************************
echo Use secret for pulling images for pods
pause
oc -n bcgov secrets link default pathfinder --for=pull

echo **************************************************************************************
echo use a secret for pushing and pulling build images
pause
oc -n bcgov secrets link builder pathfinder

echo **************************************************************************************
echo Import/Pull images
pause
oc -n bcgov import-image jenkins-basic:v2-stable --from=docker-registry.pathfinder.gov.bc.ca:443/bcgov/jenkins-basic:v2-stable --confirm --insecure --reference-policy=local
oc -n bcgov import-image postgis-96:v1-latest --from=docker-registry.pathfinder.gov.bc.ca:443/bcgov/postgis-96:v1-latest --confirm --insecure --reference-policy=local

echo **************************************************************************************
echo Fix/Patch PV directory
pause
minishift ssh -- "sudo chmod -R a+rwx /var/lib/minishift/base/openshift.local.pv*"

echo **************************************************************************************
echo Create supported StorageClass. Ensure that minishift-storage-class.yaml exists in the current directory.
pause
oc create -f minishift-storage-class.yaml

echo **************************************************************************************
echo Minishift will automatically create 100 PVs allocate PVs to storageClassName as needed
echo Check all the persistent volumes minishift has already created.
echo We want to set their storage type, it is currently empty, run the next command to list all PVs
pause
oc get pv

echo **************************************************************************************
echo Now we will run a powershell script to patch the PVCs
pause
powershell ./patch-pvcs.ps1

echo **************************************************************************************
echo Create a privileged service account
echo This account will have anyuid privilege so you can run as root and for instance iteratively figure out how to create an image
pause
oc -n myproject create sa privileged
oc -n myproject adm policy add-scc-to-user anyuid -z privileged

echo **************************************************************************************
echo This is just to spin up an image for a test using the privileged account
echo Press CTRL+D to exit the pod
pause
oc -n myproject run rhel7-tools --serviceaccount=privileged --image=registry.access.redhat.com/rhel7/rhel-tools:latest -it --rm=true --restart=Never --command=true -- bash

echo **************************************************************************************
echo ALL SETUP IS COMPLETE