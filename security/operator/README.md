

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
cd networksecuritypolicy
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
ln -s $PWD/roles /opt/ansible/roles
ln -s $PWD/*.yaml /opt/ansible/
```

Install the custom resource definition (CRD) on the k8s (OpenShift) cluster: 

```console
kubectl apply -f deploy/crds/defenition.yaml
```

Bring the operator on-line. The `config.yaml` is your k8s config file with credentials to access the cluster. The flag `zap-encoder` is used to make the logging slightly more readable; if you don't use `console` you'll get fairly unreadable `JSON`. The argumentd `--namespace` needs to be a specific namespace or an empty string to monitor __all__ namespaces.

```console
operator-sdk up local --kubeconfig=config.yaml --zap-encoder console --namespace ''
```

At this point you'll see some JSON debug messages in the console and you're ready to go. The operator is running locally and the `playbook.yaml` will be run whenever a CRUD change is made to the associated CR. Open another terminal and try creating a CR:

```console
kubectl apply -f deploy/crds/example-resource.yaml
```

You can do k8s operations on CRs by name, for example:

```
➜  networksecuritypolicy git:(master) ✗ kubectl get networksecuritypolicy
NAME                   AGE
example-networksecuritypolicy   11m
```

# Deploy It

Get your operator up-and-running.

k apply -f networksecuritypolicy/deploy/crds/defenition.yaml \
        -f networksecuritypolicy/deploy/role.yaml \
        -f networksecuritypolicy/deploy/role_binding.yaml \
        -f networksecuritypolicy/deploy/service_account.yaml \
        -f networksecuritypolicy/deploy/operator.yaml

# Test It

k apply -f security/operator/networksecuritypolicy/deploy/crds/example-resource.yaml

This can also be tested locally with:

```console
pip install docker molecule openshift
```

```console
molecule test -s test-local
```

# Development

## Change Scope

To change how the Operator is scoped follow the guidance in this document:

https://github.com/operator-framework/operator-sdk/blob/master/doc/operator-scope.md

