# Repo Mapper

## Purpose
This ansible utility will query all build configs with an OpenShift environment and map out the associated git repos details and metadata that is tied to an OpenShift project. 

### Prerequisite
- install ansible
    ```shell
    # check python version:
    python3 --version
    pip3 --version
    # Ansible
    pip3 install ansible
    # Verify the py version used by ansible:
    ansible --version
    ```

- install packages included in requirements.txt
    ```shell
    sudo pip3 install --user --force-reinstall -r requirements.txt
    ```

### Local usage
*Note:* Run the following playbook while logged into an OpenShift cluster with `cluster-reader` access on `namespaces`, if also exporting GitHub repos, one could need access cluster role with `buildConfig` resources.

```shell
cd ansible
# include -vvv for debugging mode

# List standard namespace metadata:
ansible-playbook repo-mapper.yml

# List all GitHub repo used for builds on OpenShift
ansible-playbook repo-mapper.yml -e map_repo=True
```

### Run on OpenShift
Use the OpenShift manifests to build and deploy the ansible playbook.
```shell
cd .openshift

# update the local.param file
# Build:
oc process --ignore-unknown-parameters=true -f build.yml --param-file=local.param | oc apply -f -
# Deploy:
oc process --ignore-unknown-parameters=true -f deployment.yml --param-file=local.param | oc apply -f -
```

### Duration
Standard list of namespace would not take long. However, if you are also outputing all relevant GitHub repos, then the current run time against the prod Pathfinder cluster is about 35mins.

### Objects
All data is collected into a dictionary object and can be used to create an export file or to push data into an external system. The object structure looks as follows: 

```
        {
            "BuildConfigName": "platform-services",
            "GitHubOrg": "BCDevOps",
            "GitHubRepo": "platform-services",
            "MinistryLead": "",
            "MinistryOrg": "",
            "ProductLead": "shea.stewart@arctiq.ca",
            "Project": "aaa-label-test"
        }
```

In the example above, you can see that we are missing the MinistryLead and MinistryOrg labels on the OpenShift project. 
Additional labels can be added to the query as necessary. See `vars.yml` and `tasks/create_map.yml` to extend this capability.  

### Output
This utility currently generates a CSV output file. This can be extended as needed. 
The template `tasks/templates/repo_namespace_metadata.csv.j2` can be modified to include additional fields. 

### Possible Improvements
~~We could likely load in all project data in a single API call to speed this up.~~
<!-- todo: combining the repo search to project query -->

### JSON Lookup Reference
- [Sample Project Lookup](tasks/templates/sample-project.json)
- [Sample BuildConfig Lookup](tasks/templates/sample-buildconfig.json)