

# Development

## Build It

Setup your development environment.

You can install the operator framework and associated tools locally or use the [Dockerfile](./operator/Dockerfile) in the root of the operator directory to create a development environment. To build the development environment run run:

```console
cd operator && \
docker build . --tag bcgov/secops
```

When the image build completes you need to run in in such a way that it has access to your local docker daemon so that it can, in tern, build the operator image:

```console
docker run -it --rm --name secops \
-v /var/run/docker.sock:/var/run/docker.sock \
-v $(pwd):/operator bcgov/secops
```

Once the image is run you'll be placed in the `/operator` directory. Next, build the operator image that'll be run on OpenShift or k8s. Switch to the operator project directory:

```console
cd secopspolicy
```

Then use the `operator-sdk` to build the image. You can vary the image tag `bcgov/secops-operator` shown below as you see fit. If you vary the tag name you will need to update it in (two places) in the `operator.yaml` file.

```console
operator-sdk build bcgov/secops-operator
```

Now you're ready to deploy and run the operator.

## Test It

Run your development environment (image). You'll be propelled into the `/operator` working directory; all the commands below will assume that's where you're at. You're going to keed your k8s config so you `kubectl` and `operator-sdk` can talk to your k8s cluster. Put it in (or mount as a volume) to `$HOME/.kube/config`

```console
docker run -it --rm --name secops \
-v /var/run/docker.sock:/var/run/docker.sock \
-v $(pwd):/operator bcgov/secops
```

Link the the operator `roles` and `playbook.yaml` so that ansible can access them:

```console
ln -s $PWD/roles/secopspolicy /opt/ansible/roles/secopspolicy
ln -s $PWD/playbook.yml /opt/ansible/playbook.yml
```

Install the custom resource definition (CRD) on the k8s (OpenShift) cluster: 

```console
kubectl apply -f deploy/crds/defenition.yaml
```

Bring the operator on-line. The `config.yaml` is your k8s config file with credentials to access the cluster. The flag `zap-encoder` is used to make the logging slightly more readable; if you don't use `console` you'll get fairly unreadable `JSON`.

```console
operator-sdk up local --kubeconfig=config.yaml --zap-encoder console
```

At this point you'll see some JSON debug messages in the console and you're ready to go. The operator is running locally and the `playbook.yaml` will be run whenever a CRUD change is made to the associated CR. Open another terminal and try creating a CR:

```console
kubectl apply -f deploy/crds/example-resource.yaml
```

You can do k8s operations on CRs by name, for example:

```
➜  secopspolicy git:(master) ✗ kubectl get secopspolicy
NAME                   AGE
example-secopspolicy   11m
```

# Deploy It

Get your operator up-and-running.

k apply -f secopspolicy/deploy/crds/defenition.yaml \
        -f secopspolicy/deploy/role.yaml \
        -f secopspolicy/deploy/role_binding.yaml \
        -f secopspolicy/deploy/service_account.yaml \
        -f secopspolicy/deploy/operator.yaml

# Test It
k apply -f security/operator/secopspolicy/deploy/crds/example-resource.yaml

This can also be tested locally with:

```console
pip install docker molecule openshift
```

```console
molecule test -s test-local
```

# Validate 

This is what you see before an event

```console
➜  platform-services git:(master) ✗ k logs secopspolicy-operator-6979588f9b-vbvhj ansible
Setting up watches.  Beware: since -r was given, this may take a while!
Watches established.
```

This is what you see after an event:

```console
➜  platform-services git:(master) ✗ k logs secopspolicy-operator-6979588f9b-vbvhj ansible
Setting up watches.  Beware: since -r was given, this may take a while!
Watches established.
/tmp/ansible-operator/runner/secops.pathfinder.gov.bc.ca/v1alpha1/SecOpsPolicy/default/example-secopspolicy/artifacts/2501072949750338700//stdout
ansible-playbook 2.7.10

  config file = /etc/ansible/ansible.cfg
  configured module search path = [u'/usr/share/ansible/openshift']
  ansible python module location = /usr/lib/python2.7/site-packages/ansible
  executable location = /usr/bin/ansible-playbook
  python version = 2.7.5 (default, Jun 20 2019, 20:27:34) [GCC 4.8.5 20150623 (Red Hat 4.8.5-36)]
Using /etc/ansible/ansible.cfg as config file

/tmp/ansible-operator/runner/secops.pathfinder.gov.bc.ca/v1alpha1/SecOpsPolicy/default/example-secopspolicy/inventory/hosts did not meet host_list requirements, check plugin documentation if this is unexpected

/tmp/ansible-operator/runner/secops.pathfinder.gov.bc.ca/v1alpha1/SecOpsPolicy/default/example-secopspolicy/inventory/hosts did not meet script requirements, check plugin documentation if this is unexpected

/tmp/ansible-operator/runner/secops.pathfinder.gov.bc.ca/v1alpha1/SecOpsPolicy/default/example-secopspolicy/inventory/hosts did not meet script requirements, check plugin documentation if this is unexpected

PLAYBOOK: playbook.yml *********************************************************


PLAYBOOK: playbook.yml *********************************************************
1 plays in /opt/ansible/playbook.yml

PLAY [localhost] ***************************************************************
META: ran handlers

TASK [Debug Information] *******************************************************
task path: /opt/ansible/playbook.yml:6

    "msg": {
        "_secops_pathfinder_gov_bc_ca_secopspolicy": {
            "apiVersion": "secops.pathfinder.gov.bc.ca/v1alpha1", 
            "kind": "SecOpsPolicy", 
            "metadata": {
                "annotations": {
                    "kubectl.kubernetes.io/last-applied-configuration": "{\"apiVersion\":\"secops.pathfinder.gov.bc.ca/v1alpha1\",\"kind\":\"SecOpsPolicy\",\"metadata\":{\"annotations\":{},\"name\":\"example-secopspolicy\",\"namespace\":\"default\"},\"spec\":{\"size\":35}}\n"
                }, 
                "creationTimestamp": "2019-06-28T17:12:12Z", 
                "generation": 2, 
                "name": "example-secopspolicy", 
                "namespace": "default", 
                "resourceVersion": "1677", 
                "selfLink": "/apis/secops.pathfinder.gov.bc.ca/v1alpha1/namespaces/default/secopspolicies/example-secopspolicy/status", 
                "uid": "de6681d0-99c7-11e9-a709-c20078c36a7a"
            }, 
            "spec": {
                "size": 35
            }, 
            "status": {
                "conditions": [
                    {
                        "lastTransitionTime": "2019-06-28T17:12:12Z", 
                        "message": "Running reconciliation", 
                        "reason": "Running", 
                        "status": "True", 
                        "type": "Running"
                    }
                ]
            }
        }, 
        "ansible_check_mode": false, 
        "ansible_connection": "local", 
        "ansible_diff_mode": false, 
        "ansible_facts": {}, 
        "ansible_forks": 5, 

        "ansible_inventory_sources": [
            "/tmp/ansible-operator/runner/secops.pathfinder.gov.bc.ca/v1alpha1/SecOpsPolicy/default/example-secopspolicy/inventory"
        ], 
        "ansible_playbook_python": "/usr/bin/python2", 
        "ansible_run_tags": [
            "all"
        ], 
        "ansible_skip_tags": [], 
        "ansible_verbosity": 2, 
        "ansible_version": {
            "full": "2.7.10", 
            "major": 2, 
            "minor": 7, 
            "revision": 10, 
            "string": "2.7.10"
        }, 
        "group_names": [
            "ungrouped"
        ], 
        "groups": {
            "all": [
                "localhost"
            ], 
            "ungrouped": [
                "localhost"
            ]
        }, 
        "inventory_dir": "/tmp/ansible-operator/runner/secops.pathfinder.gov.bc.ca/v1alpha1/SecOpsPolicy/default/example-secopspolicy/inventory", 
        "inventory_file": "/tmp/ansible-operator/runner/secops.pathfinder.gov.bc.ca/v1alpha1/SecOpsPolicy/default/example-secopspolicy/inventory/hosts", 
        "inventory_hostname": "localhost", 
        "inventory_hostname_short": "localhost", 
        "meta": {
ok: [localhost] => {
    "msg": {
        "_secops_pathfinder_gov_bc_ca_secopspolicy": {
            "apiVersion": "secops.pathfinder.gov.bc.ca/v1alpha1", 
            "kind": "SecOpsPolicy", 
            "metadata": {
                "annotations": {
                    "kubectl.kubernetes.io/last-applied-configuration": "{\"apiVersion\":\"secops.pathfinder.gov.bc.ca/v1alpha1\",\"kind\":\"SecOpsPolicy\",\"metadata\":{\"annotations\":{},\"name\":\"example-secopspolicy\",\"namespace\":\"default\"},\"spec\":{\"size\":35}}\n"
                }, 
                "creationTimestamp": "2019-06-28T17:12:12Z", 
                "generation": 2, 
                "name": "example-secopspolicy", 
                "namespace": "default", 
                "resourceVersion": "1677", 
                "selfLink": "/apis/secops.pathfinder.gov.bc.ca/v1alpha1/namespaces/default/secopspolicies/example-secopspolicy/status", 
                "uid": "de6681d0-99c7-11e9-a709-c20078c36a7a"
            }, 
            "spec": {
                "size": 35
            }, 
            "status": {
                "conditions": [
                    {
                        "lastTransitionTime": "2019-06-28T17:12:12Z", 
                        "message": "Running reconciliation", 
                        "reason": "Running", 
                        "status": "True", 
                        "type": "Running"
                    }
                ]
            }
        }, 
        "ansible_check_mode": false, 
        "ansible_connection": "local", 
        "ansible_diff_mode": false, 
        "ansible_facts": {}, 
        "ansible_forks": 5, 
        "ansible_inventory_sources": [
            "/tmp/ansible-operator/runner/secops.pathfinder.gov.bc.ca/v1alpha1/SecOpsPolicy/default/example-secopspolicy/inventory"
        ], 
        "ansible_playbook_python": "/usr/bin/python2", 
        "ansible_run_tags": [
            "all"
        ], 
        "ansible_skip_tags": [], 
        "ansible_verbosity": 2, 
        "ansible_version": {
            "full": "2.7.10", 
            "major": 2, 
            "minor": 7, 
            "revision": 10, 
            "string": "2.7.10"
        }, 
        "group_names": [
            "ungrouped"
        ], 
        "groups": {
            "all": [
                "localhost"
            ], 
            "ungrouped": [
                "localhost"
            ]
        }, 
        "inventory_dir": "/tmp/ansible-operator/runner/secops.pathfinder.gov.bc.ca/v1alpha1/SecOpsPolicy/default/example-secopspolicy/inventory", 
        "inventory_file": "/tmp/ansible-operator/runner/secops.pathfinder.gov.bc.ca/v1alpha1/SecOpsPolicy/default/example-secopspolicy/inventory/hosts", 
        "inventory_hostname": "localhost", 
        "inventory_hostname_short": "localhost", 
        "meta": {
            "name": "example-secopspolicy", 
            "namespace": "default"
        }, 
        "playbook_dir": "/opt/ansible", 
        "size": 35
    }
}

TASK [echo] ********************************************************************
task path: /opt/ansible/playbook.yml:13
ok: [localhost] => {
    "msg": "hi 35"
}
META: ran handlers
META: ran handlers

PLAY RECAP *********************************************************************
localhost                  : ok=2    changed=0    unreachable=0    failed=0   
```