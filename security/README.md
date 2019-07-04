

# Network Security Policy

Sample policy to allow two namesapces to talk; future version would be able to apply a wildcard like `devhub-*`. The operator will ensure the originating matches the source. The destination namespace will need to add a similar rule with the source and destination reversed to enable bi-directional communication.

```yaml
apiVersion: secops.pathfinder.gov.bc.ca/v1alpha1
kind: SecOpsPolicy
metadata:
  name: inter-namespace-comms
spec:
  description: |
    allow the devhub namespace to talk to the VON
    namespace.
  action: Allow
  source: devhub-tools
  destination: von-tools
``` 