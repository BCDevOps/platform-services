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

There is an operator running on the cluster that watches for the creation of `ArtifactorySA` objects in any project on the cluster. When one is created, it automatically acts to create service account; a related account in artifactory; and a secret in with the related artifactory account credentials. Use the credentials stored in the secret in your pipeline (for example, in `npm`). 

☝️Note: The the newly minted secret will have a "license-plate" style prefix followed by "artifactorysa". The licensplate prefix is the `username` and the password (or token) is encoded in the secret. 

Here is an example:

```console
➜  oc get secrets | grep artifactory
krmjzf-artifactorysa       Opaque            2      1h
➜ 
```

Here is the handy command you can use to fetch the password:

```console
oc get secrets/krmjzf-artifactorysa -o template --template="{{.data.password}}" | base64 --decode
```

Find a template for creating an ArtifactorySA object at `artifactory-sa-operator/deploy/crds/artifactory-sa-cr-template.yaml`

Find the variable definition file at `artifactory-sa-operator/deploy/crds/serviceaccount.env`

Download both to your local machine and update the serviceaccount.env file to reflect the information you require. 

☝️Note: That CR_NAME will be the name of the custom resource in your project for ease of searching, not the name of the service account itself.

Log into OpenShift with your personal credentials. Switch to your project, then run the following command:

```
oc process -f artifactory-sa-cr-template.yaml --param-file=serviceaccount.env --ignore-unknown-parameters=true | oc create -f -`
```

If you want to do this without downloading the files you can use this shortcut command:

```console
oc process -f https://raw.githubusercontent.com/BCDevOps/platform-services/master/apps/artifactory/artifactory-sa-operator/deploy/crds/artifactory-sa-cr-template.yaml -p CONSOLE_NAME=prod -p CR_NAME=testaccount -p DESCRIPTOR="this is a test service account" | oc create -f -
```

You will require admin or edit privileges on the project to create the service account custom resource object.

When the service account is created, it will automatically have access to the proxy repos. If that's all you require, you can stop here! Otherwise, continue to learn about creating local repos and granting access to them.

### Step 3: Requesting a Local or Virtual Repo

Request an new local or virtual repo here: https://github.com/BCDevOps/devops-requests/issues/new?template=artifactory_repo_request.md

Please group your requests together - if you want to request both a local and virtual repo, just copy the list of required information and fill it out multiple times in the same issue.

The following information is necessary for creating a repo:

* Requester: this is your **Personal Artifactory Username** (`@github` or `@idir`)
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
To do so, log into the Artifactory GUI (at https://artifacts.developer.gov.bc.ca) and login with your personal credentials. 
You will only be able to do that if you were the requester indicated in Step 3. If not, please have them perform this task.

Once you are logged in, you will be able to click on the "admin" panel (on the left side menu, it looks like a small bust of a person). From there, click "Permissions".
On the Permissions screen, you will be able to see all of the repos whose access you can control. Click on any of them.
Once you've opened the Permission screen for that repository, click Users, and drag any username from the available list into the "Included Users" list to provide access. Use the filter to search for specific names.
Highlight the user you've added to the "Included Users" list and select any of the appropriate repository actions that you wish them to be able to perform.
Mouse over the ? next to "Repository Actions" to find out more about what each privilege does. **Avoid providing the Manage privilege to many users.**

Here are some likely privileges that you'll want to provide:
* Give read, annotate, deploy/cache to other members of your team so that they can read and deploy objects to the repo.
* Give read, annotate, deploy/cache to any service accounts which should be able to deploy objects to the repo.
* Give read to service accounts which should be able to build from the local repo.

Do not forget to click "Save and Finish" in the bottom right corner once you've added the appropriate permissions.

## Notes About Logging in from the CLI/API

In order to use your personal credentials to log into the Artifactory API, you must have logged in via the GUI at least once first (in order to create your credentials through Keycloak).
You must go to your user profile and generate an API key to use. Your idir/github password will not work.

### NPM

You cannot login to Artifactory with the `npm login` due to the use of the @ sign in usernames assigned by Keycloak.

As such, in order to use NPM, you must run the following command:

```console
curl --user <username>:<api_key> https://artifacts.pathfinder.gov.bc.ca/artifactory/api/npm/auth
```

Your username should be of the form user@idir or user@github. It will return three lines of information which you can then paste into your ~/.npmrc file to use instead of basic authentication.

If you're using the service account / secret mentioned above in your pipeline use something similar to the following process by adding these commands to your Jenkinsfile:

Tell NPM to use Artifactory: 
```console
npm config set registry https://artifacts.developer.gov.bc.ca/artifactory/api/npm/npm-remote/
```

Prep your username and password for easy access:
```console
export AF_USER=$(oc get secrets | grep artifactorysa | awk -F- '{ print $1 }')
export AF_PASSWD=$(oc get secrets/$AF_USER-artifactorysa -o template --template="{{.data.password}}" | base64 --decode)
```

As mentioned above you can't use `npm logon` so you need to fetch the auth credentials and put them in `.npmrc`:

```console
curl -u $AF_USER:$AF_PASSWD https://artifacts.developer.gov.bc.ca/artifactory/api/npm/auth >> ~/.npmrc
```

You should be able to run `npm i` or `npm i -S blarb` and utilize artifactory for lightning fast builds.
