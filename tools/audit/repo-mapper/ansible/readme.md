# Repo Mapper

## Purpose
This ansible utility will query all build configs with an OpenShift environment and map out the associated git repos details and metadata that is tied to an OpenShift project. 

### Filters
This utility specifically looks for anything in the `BCDevOps` and `bcgov-c` GitHub Orgs. This filtering can be extended in the `tasks/create_map.yml` file. 

### Usage

Run the following playbook while logged into an OpenShift cluster with `cluster-reader` access. 

```
ansible-playbook  repo-mapper.yml
```

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
The template `templates/csv_output.csv.j2` can be modified to include additional fields. 

### Possible Improvements
We could likely load in all project data in a single API call to speed this up. 

## JSON Lookup Reference

#### Projects
Sample Project Lookup 
```
    "msg": {
        "apiVersion": "v1",
        "kind": "Project",
        "metadata": {
            "annotations": {
                "openshift.io/description": "",
                "openshift.io/display-name": "",
                "openshift.io/requester": "stewartshea",
                "openshift.io/sa.scc.mcs": "s0:c28,c17",
                "openshift.io/sa.scc.supplemental-groups": "1000790000/10000",
                "openshift.io/sa.scc.uid-range": "1000790000/10000",
                "product-lead": "shea.stewart@arctiq.ca"
            },
            "creationTimestamp": "2019-12-02T21:08:31Z",
            "labels": {
                "project_type": "user"
            },
            "name": "aaa-label-test",
            "resourceVersion": "470395469",
            "selfLink": "/oapi/v1/projects/aaa-label-test",
            "uid": "e4d71aee-1547-11ea-ab8b-00505683c9cc"
        },
        "spec": {
            "finalizers": [
                "kubernetes"
            ]
        },
        "status": {
            "phase": "Active"
        }
    }
}
```

#### Build Configs

Sample BuildConfig Lookup
```
    "msg": {
        "apiVersion": "v1",
        "kind": "BuildConfig",
        "metadata": {
            "annotations": {
                "openshift.io/generated-by": "OpenShiftNewBuild"
            },
            "creationTimestamp": "2019-12-02T21:14:32Z",
            "labels": {
                "build": "platform-services"
            },
            "name": "platform-services",
            "namespace": "aaa-label-test",
            "resourceVersion": "470400668",
            "selfLink": "/oapi/v1/namespaces/aaa-label-test/buildconfigs/platform-services",
            "uid": "bbe8dcec-1548-11ea-a7ae-00505683394a"
        },
        "spec": {
            "failedBuildsHistoryLimit": 5,
            "nodeSelector": null,
            "output": {
                "to": {
                    "kind": "ImageStreamTag",
                    "name": "platform-services:latest"
                }
            },
            "postCommit": {},
            "resources": {},
            "runPolicy": "Serial",
            "source": {
                "contextDir": "security/aporeto/operator/secopspolicy",
                "git": {
                    "uri": "https://github.com/BCDevOps/platform-services"
                },
                "type": "Git"
            },
            "strategy": {
                "dockerStrategy": {
                    "from": {
                        "kind": "ImageStreamTag",
                        "name": "ansible-operator:v0.10.1"
                    }
                },
                "type": "Docker"
            },
            "successfulBuildsHistoryLimit": 5,
            "triggers": [
                {
                    "github": {
                        "secret": "vhYrPZPVNgwLl4CL73Zy"
                    },
                    "type": "GitHub"
                },
                {
                    "generic": {
                        "secret": "cnMT-KrzOpWs1YZemGB8"
                    },
                    "type": "Generic"
                },
                {
                    "type": "ConfigChange"
                },
                {
                    "imageChange": {
                        "lastTriggeredImageID": "quay.io/operator-framework/ansible-operator@sha256:e921d4b44c94dc4c791f5acd86af89d51959baa21c457755db0f40452b37ee17"
                    },
                    "type": "ImageChange"
                }
            ]
        },
        "status": {
            "lastVersion": 1
        }
    }
}
```