# Aporeto Zero Trust Network Security Enforcement
The Aporeto solution is a multi-cluster multi-cloud zero trust network solution that will deny all traffic from all processing units until expliticly allowed. For the purpose of the OpenShift environment, a "Pod" is considered a "Processing Unit". This solution creates an "identity" for each processing unit that allows for much more granular access control policies beyond a simple network address. 

## Resources
- Aporeto Links
  - [Console](https://console.aporeto.com/app/)
  - [Documentation](https://docs.aporeto.com/docs)

- People
  - BCDevOps Security Team

## Documentation Layout
- Build Documents
  - [Deployment Steps](build/deployment.md)
- Administration Documents
  - [Authentication & Authorization](admin/auth.md)
- Design Patterns
  - [Design Pattern 01 - Single Namespace Microsegmentation](design_patterns/design_pattern_01/design_pattern-single_namespace_microsegmentation.md)

# Issue Tracking
Please use GitHub issues in this repo with the "security/aporeto". 

