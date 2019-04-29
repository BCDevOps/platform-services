## Namespaces
TOOLS_NAMESPACE: `c81e6h-tools`
DEV_NAMESPACE: `c81e6h-dev`
TEST_NAMESPACE: `c81e6h-test`
PROD_NAMESPACE: `c81e6h-prod` 

## Deployment (Currently in a separate branch)
oc project c81e6h-tools
oc new-build https://github.com/BCDevOps/platform-services#status-page --context-dir=apps/statuspage/.pipeline