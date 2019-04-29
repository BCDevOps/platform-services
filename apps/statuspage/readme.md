## Namespaces

```
export TOOLS_NAMESPACE="c81e6h-tools"
export DEV_NAMESPACE="c81e6h-dev"
export TEST_NAMESPACE="c81e6h-test"
export PROD_NAMESPACE="c81e6h-prod"
```

## Prerequisites 
- Jenkins Service Account access to each namespace
    - Run the following as a user with admin access to the appropriate namespaces
        ```
        oc adm policy add-role-to-user edit system:serviceaccount:$TOOLS_NAMESPACE:jenkins -n $DEV_NAMESPACE
        oc adm policy add-role-to-user edit system:serviceaccount:$TOOLS_NAMESPACE:jenkins -n $TEST_NAMESPACE
        oc adm policy add-role-to-user edit system:serviceaccount:$TOOLS_NAMESPACE:jenkins -n $PROD_NAMESPACE
        ```

## Deployment (Currently in a separate branch)

```
oc project c81e6h-tools
oc new-build https://github.com/BCDevOps/platform-services#status-page --context-dir=apps/statuspage/.pipeline
```