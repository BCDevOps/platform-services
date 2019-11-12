# Using Artifactory

## Artifactory: What It Does and What It Doesn't.

Artifactory is an artifact repository by JFrog. The software documentation can be found here: https://www.jfrog.com/confluence/display/RTF/Welcome+to+Artifactory

The Developer Experience Team provides Artifactory for two purposes:
1. Caching artifacts from the public internet to allow faster builds.
2. Private repositories for artifacts that teams create/use and which cannot be provided to the public.

The first purpose is fulfilled with caching proxy repos, all of which follow the naming scheme `<source>-<type>-remote`.
The list of available proxy repos is controlled by the Developer Experience Team. If you wish to see another one added to the list, contact the team to discuss.
Any new Artifactory account automatically comes with access to these proxy repos. You can access it with your personal account, and you can create an ArtifactorySA (service account) to pull artifacts as part of your pipeline.

The second purpose is fulfilled through a request to the Developer Experience Team, requesting an the creation of an ArtifactoryRepo object.

See the next section for more information on how to set yourself up with the appropriate service account(s) and local repos.

## Getting Set Up to Use Artifactory

### Step 1: Create Your Personal Artifactory Account

Artifactory can be found here: https://artifacts.developer.gov.bc.ca

Sign in with Keycloak.

The resulting account will be in the form of `<github_name>@github ` or `<idir_name>@idir`, depending on which method you use to sign in through Keycloak. 
This will allow you to log in and see the proxy repos mentioned in the previous section.
See Step 4 below to learn how to gain access to private local and virtual repos.

### Step 2: Create an Artifactory Service Account

When connecting to Artifactory for the purposes of pulling artifacts for your application to use, you should not use your personal credentials. Instead, use an artifactory service account.

There is an operator running on the cluster which watches for the creation of ArtifactorySA objects in any project on the cluster. 
When one is created, it automatically acts to create a matching service account in artifactory. This service account will have a "license-plate" style name, and the ArtifactorySA object will be updated to include this name once the operator has created the account.
It will also create a secret in the same project with both the name of the service account and a token for accessing the account.

Find a template for creating an ArtifactorySA object at `artifactory-sa-operator/deploy/crds/artifactory-sa-cr-template.yaml`

Find the variable definition file at `artifactory-sa-operator/deploy/crds/serviceaccount.env`

Download both to your local machine and update the serviceaccount.env file to reflect the information you require. 
Note that CR_NAME will be the name of the custom resource in your project for ease of searching, not the name of the service account itself.

Log into OpenShift with your personal credentials. Switch to your project, then run the following command:

```
oc process -f artifactory-sa-cr-template.yaml --param-file=serviceaccount.env --ignore-unknown-parameters=true | oc create -f -`
```

You will require admin or edit privileges on the project to create the service account custom resource object.

When the service account is created, it will automatically have access to the proxy repos. If that's all you require, you can stop here! Otherwise, continue to learn about creating local repos and granting access to them.

### Step 3: Requesting a Local or Virtual Repo

Request an new local or virtual repo here: https://github.com/BCDevOps/devops-requests/issues/new?template=artifactory_repo_request.md

Please group your requests together - if you want to request both a local and virtual repo, just copy the list of required information and fill it out multiple times in the same issue.

The following information is necessary for creating a repo:

* Team Name: this is the name of the team requesting the repo. 
* Repo Type: the type of artifacts that belong in the repo (ex: maven, docker, etc)
* Repo Location: local or virtual.
   * Local repos provide a private place for you to upload your artifacts.
   * Virtual repos combine multiple repos under one address.
* Repo Description: a description of your repo.
* Primary OpenShift Project: the openshift project where you would like the ArtifactRepo object and the admin token secret to be created.
* (if virtual) List of Related Repos: if you're creating a virtual repo, list the repos to be combined.

Once this request is approved, the Developer Experience Team will create an ArtifactoryRepo in your chosen project.
This will result in the creation of your repo, an admin account through which you can admin access to the repo, and a secret in your project which contains the token to access the admin account.

### Step 4: Granting Access to your Private Repo

Once you have followed the previous steps, you're likely going to want to grant read and/or write access to any new local repos to personal or service accounts.
There is an ansible playbook available to help this process.

Find the playbook at `artifactory-sa-operator/serviceaccount-permissions.yaml`

Download an open the playbook, and edit the following vars:
* `service_account` is the randomized name of the service account to be given the permissions.
* `repo_name` is the name of the repository that you're granting permissions to.
* `admin_token` is the access token for the admin account associated with the repo - this can be found in a secret with the same name as the repo, in your project.
* `privileges` are the list of privileges you mean to give the service account - the list provided includes everything you should want to use, so delete any you don't want.
   * `read` allows the account to see the artifacts.
   * `write` allows the account to change/upload artifacts.
   * `annotate` allows the account to create artifact metadata.
   * `delete` allows the account to delete or overwrite artifacts.
   * there is an additional privilege called `manage` which permits the account to control access to the repository. It is not in the list because we do not recommend granting this privilege to any account but the repo admin account.

Once your edits are complete, use the following command to run the playbook.

```bash
ansible-playbook serviceaccount-permissions.yaml
```

## Notes About Logging in from the CLI/API

In order to use your personal credentials to log into the Artifactory API, you must have logged in via the GUI at least once first (in order to create your credentials through Keycloak).
You must go to your user profile and generate an API key to use. Your idir/github password will not work.

### NPM

You cannot login to Artifactory with
``` npm login ```
due to the use of the @ sign in usernames assigned by Keycloak.

As such, in order to use NPM, you must run the following command:
``` bash
curl --user <username>:<api_key> https://artifacts.pathfinder.gov.bc.ca/artifactory/api/npm/auth
```
Your username should be of the form user@idir or user@github. It will return three lines of information which you can then paste into your ~/.npmrc file to use instead of basic authentication.
