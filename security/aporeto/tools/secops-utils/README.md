# Introduction

This is a DevSecOps service that exports Aporeto policy for audit purposes periodically based on an OpenShift Container Platform (OCP) CronJob.

**Implementation Notes**
- The ansible playbook that is responsible for installing Aporeto also provides a method for implementing this CronJob within OpenShift. The instructions below can be used for manual installation if necessary. 
- Only one deployed instance of this is required since it backs up the entire Aporeto set of namespaces. There is no need to configure this within each cluster. 

# How it Works

To record nightly exports of Aporeto policy this service has three components:

## Ansible Playbook

The Ansible playbook is the workhorse of this service and can be run manually to create an archive of current policy. The playbook logic fetches a private repository to which it records the exported policy in a directory structure matching the Aporeto namespace hearchey.

## CronJob

An OCP CronJob that is schedules to start at 13:20 AM UTC (~ 03:20 AM PST). 

## Ansible Runner

A custom Ansible runner container image is used as the execution environment for the playbook. It contains both Ansible and the Aporeto command line tool (CLI).

# Deployment

## Setup

There are a few things you need to get in place before running this playbook including:

1. A repository that can be used to record the results of the Aporeto export;
2. An Aporeto application token (these are long lived tokens unlike user tokens);
3. A SSH key pare so the playbook can update the repository.

## Private Repository

While not overly sensitive information as a matter of best practice create a private repository to store the exported Aporeto policy. This repository will be cloned and a directory structure will be created mirroring the Aporeto namespace hierarchy.

Make sure you have a `master` branch in your repository.

## Aporeto Token

An Aporeto access token is needed by `apoctl` so that it can export policy for all the given namespaces. Make sure it has enough access to export policy starting at the root namespace. Create an **application access token** as they are long lived and won't expire after 24h like a Personal Access Token; you can use your own PAT for testing purposes if you have enough access. 

For convenience, set an environment variable with the token; subsequent commands will assume you have done this:

```console
export APOCTL_TOKEN=paste-the-token-here
```

## SSH Deployment Key

The playbook uses a SSH Deployment Key with write access to both fetch and push updates to the git repo. Create a deployment key with the following command:

```console
ssh-keygen -t rsa -C "your_email@example.com" -q -N "" -f secops-cronjob
```

This will create two files representing your private and public key pair; your public key is the one with the `.pub` extensions.

Copy the public key and upload it as a deployment key to GitHub or whatever SCM you use. Then, for convenience, set an environment variable with the base64 encoded private key; subsequent commands will assume you have done this:

```console
export GIHUB_DKEY=$(cat secops-cronjob | base64)
```

## Build

To run this playbook locally or otherwise you need the bespoke Ansible Runner image with supporting tooling (Aporeto CLI, Git, etc). The Ansible Runner image is based on RHEL7 which requires licencing and access to the RedHat Container Registry and proprietary package repositories. To build it, run the following command on the OCP:

```console
oc process -f openshift/build.yaml | oc create -f -
```

This build template will create a `build` in OCP named `secops-utils`. If an initial build is not automatically triggered you can create one by running the following command:

```console
oc start-build secops-utils
```

When the build completes a newly minted image can be found in the image stream `secops-utils`. You can pull this image to run locally or run it on the OCP as needed.

**🤓 ProTip**

- Inspect the YAML manifest to see what parameters you can change on the fly.

## Run / Test

You can run the playbook on the OCP for testing purposes with the command below. You'll need to have both `GITHUB_DKEY` and `APOCTL_TOKEN` environment variables set so the values can be passed on to the running container. Replace the faux namespace `blabla-tools` in the command below with your working namespace.

```console
oc run apoexpt --image=docker-registry.default.svc:5000/blabla-tools/secops-utils:latest --replicas=1 --restart=Never --requests="cpu=1,memory=1Gi" --limits="cpu=1,memory=1Gi" --restart=Never --image-pull-policy=Always --env="GITHUB_DKEY=$GITHUB_DKEY" --env="APOCTL_TOKEN=$APOCTL_TOKEN"
```

When the playbook completes you will see a commit containing all the exported policy.

**🤓 ProTip**

- It takes about 35min for the playbook to run with 1,800 policies on the OCP. When run locally on a MacBook Pro it takes about 17min.

## Deploy

Once you're finished testing deploy the CronJob to OCP with the following command:

```console
oc process -f openshift/deploy-cronjob.yaml -p IMAGE_NAMESPACE=blarb-sandbox NAMESPACE=blarb-sandbox -p JOB_NAME=secops-backup -p GITHUB_DKEY=$GITHUB_DKEY -p APOCTL_TOKEN=$APOCTL_TOKEN | oc apply -f -
```

Verify the CronJob was created successfully. You'll see it listed with whatever you used for `JOB_NAME` in the previous command:

```console
oc get cronjob
```

Perform a manual trial run as needed to ensure everything is working as expected:

```console
oc create job secops-backup-1 --from=cronjob/secops-backup
```

Monitor the manual job with the following command:

```console
oc logs job/secops-backup-1 -f
```

You're done 🙌

**🤓 ProTip**

- Inspect the YAML manifest to see what parameters you can change on the fly.

# Contact

This component is jointly maintained by OCIO Platform Services and the data center management team DXC. Please contact both teams via RocketChat for more information.