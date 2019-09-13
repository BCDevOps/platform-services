# Operational Workshop

Aporeto tracking:

- timelines
- features
- use cases

## Operations

### Deployment Strategy

Daemon set vs SystemD installations with CoreOS

- ssh enforcer (can set rules based on identity and matching between ssh user and aporeto identity)
- sudo enforcer
- host protection mode (not currently targetted)

New Feature with enforcers that will default them to auto-ignore all openshift/k8s related namespaces (openshift, openshift-*, etc).  This may require a fresh installation to ensure the profile is attached?

Multiple options for protecting openshift liveness and readiness checks
- protect kubelet

No enforcers on CNS nodes

Current Deployment steps:
Create project
Create Base Policy
 - look to creating fallback policy that gives all logging, and allow all
Get Helm Chart
Template Objects
Apply Objects
Modify Daemonset/labels
Apply labels to nodes

### Patching/Upgrades

### Break/Fail Scenarios

- Control plane access lost
  - existing policies will continue to be used (since we are layer 3 only)
  - layer 4 and 7 enforcement, losing access turns into a proxy (recovery needs to happen within an hour)
  - cert renewal period - needs to have control plane up within 1-x hours?
- enforcers crashing
- disaster recovery
  - test apoctl import
  - test deploy and base rules
- Test race conditions for applying policy changes
- Review fallback policy - maps

### Monitoring / Reporting (IMB)

- options for merging reporting with existing overall security reporting.
- long term log retention for all access events (years?)
  - pull from backplane and push to log target.

System Monitoring - test whether there is a manual clear required for aporeto events/alarms.

### Tennancy/Access models

Leveraging our keycloak for authentication, each ministry can stand up their own keycloak (or other OAuth service) for their specific namespace.

### Namespace Layouts

- Ministry? Branch? Project?

/bcgov-devex/platform-services/ocp-lab/lab1
                                      /lab2
                              /ocp-prod/prod1
                                       /prod2
                              /pathfinder
            /ministry/X

### Naming Conventions

### Support Model

### Troubleshooting

### Current Monitoring/Alerting

## Timelines

OCP 3.11 targetted for end of service in March 2020 (ish)

OCP 4.2 with multiple clusters starting in next 2-3 months.  
First 2 clusters (1 production 4.2, 1 lab 4.2 within next 3)

## Features

### Custom Operator

Policy provisioning:
- add CR to namespace (CRD.NetworkPolicy)
  - use apoctl directly to configure aporeto (best pick - less complexity and fits better with aporeto roadmap)
  - template into an aporeto CR (in an aporeto namespace) and leverage aporeto operator to configure aporeto. (not chosen)
  - Verify multiple changes are staged in an expected order (needs testing)

Eventually add checkbox for encryption as policy (internal traffic only, not external facing)

### Aporeto Future

Coming:

- on namespace create triggers that will generate default (fallback) rules for a namespace
- Enforcer default to ignore openshift namespaces (next release) - may need a re-deploy of the namespace
- TLS 1.3 is coming!
- Create a policy (allow TCP, UDP) with flag "enable Discovery Mode" for the rule.  Also used as a "fallback" policy
- recipes - for UI automation (future policy recipes)

Requested:

- higher quality default rules for an openshift installation

### Aporeto encryption

transparent SYN/SYN-ACK/ACK and then enforcer drops out of path (trouble with possible LB's, IPS devices, etc that strip packet headers)
Layer 4 - tcp proxy (enforcers operate as a proxy)
Layer 7 - http proxy
