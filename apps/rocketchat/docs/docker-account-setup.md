## Setting up the docker account
1. Gather the docker account information

2. In your namespace, run the command 

    ```oc create secret docker-registry <secret-name> --docker-server=docker.io --docker-username=<docker-username> --docker-password=<docker-password> --docker-email=unused```

3. Link your secret by processing and applying the template-sa-linked-image-pull-secrets.yaml with the command

    ```oc process -f ./apps/documize/openshift/template-sa-linked-image-pull-secrets.yaml -p NAMESPACE=<namespace> -p SECRET_NAME=<secret-name> | oc apply -f - -n <namespace>```
