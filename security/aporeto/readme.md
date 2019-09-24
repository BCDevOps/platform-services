# Aporeto Zero Trust Network Security Enforcement
The Aporeto solution is a multi-cluster multi-cloud zero trust network solution that will deny all traffic from all processing units until expliticly allowed. For the purpose of the OpenShift environment, a "Pod" is considered a "Processing Unit". This solution creates an "identity" for each processing unit that allows for much more granular access control policies beyond a simple network address. 

## Accessing the Console
Users can sign into the Aporeto Console with the following details below: 
- URL: https://console.aporeto.com
- Select the sign in options (three dots) and select *Sign in with OIDC*
  - Namespace: /bcgov
  - Provider: pathfinder-sso-prod

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
  - [CLI Examples](admin/cli_examples.md)
  - [Troubleshooting](admin/troubleshooting.md)
- Design Patterns
  - [Design Pattern 01 - Single Namespace Microsegmentation](design_patterns/design_pattern_01/design_pattern-single_namespace_microsegmentation.md)

# Aporeto Support
Please see the the [support datasheet](pdfs/Aporeto_Support_Datasheet.pdf) here for Aporeto product support.

- The following teams are able to contact Aporeto for support: 
  - DXC
  - DevOps Platform-Services Team

# Issue Tracking
Please use GitHub issues in this repo with the "security/aporeto". 

