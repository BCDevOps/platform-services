---
description: An overview of the Aporeto software used on the Openshift platform to implement the Zero-Trust security model including the implementation details.
tags:
- next gen security
- custom network policy
- Aporeto
- zero trust
- openshift security
- platform security
- application identity
---
# Aporeto Zero Trust Network Security Enforcement
The Aporeto solution is a multi-cluster multi-cloud zero trust network solution that will deny all traffic from all processing units until expliticly allowed. For the purpose of the OpenShift environment, a "Pod" is considered a "Processing Unit". This solution creates an "identity" for each processing unit that allows for much more granular access control policies beyond a simple network address. 

## Accessing the Aporeto Console (...Coming soon)
Users with [appropriate permissions](./architecture/design_decisions.md#access-to-aporeto-console) can sign into the Aporeto Console UI with the following details below: 
- URL: https://console.aporeto.com
- Select the sign in options (three dots) and select *Sign in with OIDC*
  - Namespace: /bcgov
  - Provider: pathfinder-sso-prod

**:point_up: Note**

> DevOps Security team is currently working on enabling access to the Aporeto Console UI for the platform applications. Stay tuned.

## Resources
- Aporeto Links
  - [Console](https://console.aporeto.com/app/)
  - [Documentation](https://docs.aporeto.com)

- People
  - BCDevOps Security Team

## Documentation Layout
- Architecture Documents
  - [High Level Architecture](architecture/high_level_design.md)
  - [Design Decisions](architecture/design_decisions.md)
- Build & Deploy Documents
  - [Anisble Automated Deployment](build/readme.md)
- Production Rollout Plan
  - [Rollout Plan](rollout_plan.md)
- Developer Documentation
  - [Developer Docs](docs/README.md)
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


# Videos

#### Operational Videos
- [Aporeto Automation Playbook Walkthrough](https://www.youtube.com/watch?v=yQzJiExljrY)
- [Aporeto Interfave Q&A](https://youtu.be/Nrf4EtxGXos)

#### Spint Demo Videos
- [Sprint 2 - Demo 1 - Single Namespace NetworkSecurityPolicy Objects](https://youtu.be/qWt9gtaHFQQ)
- [Sprint 2 - Demo 2 - Securing the Family Protection Order Project Namespace](https://www.youtube.com/watch?v=v2I0HCKRrgk)