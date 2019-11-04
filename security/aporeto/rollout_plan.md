---
description: An overview of the implementation plan for enabling Zero-Trust security mode on the BC Gov's Openshift platform.
tags:
- next gen security
- custom network policy
- networksecuritypolicu
- Aporeto
- production go-live plan
- zero trust
- openshift security
- platform security
- application identity
- policy backup
- policy change audit
- namespace hierarchy and ownership
---

# Production Rollout Plan

## Overview
This document outlines the implementation plan for Aporeto into the Production Pathfinder environment. 

## Current Environment Experience
This plan takes into account that the experience from the initial implementation should not affect exesting applications and users. Since this solution will inherently create a zero-trust network experience, automation code has been written to take this into account and to smooth the transition. 

The current experience in today's cluster is such that: 
  - Each OpenShift Project has pods that can communicate with each other (intra-namespace)
  - Pods in an OpenShift Project are not permitted to communicate across namespaces (intra-namespace)
  - Pods in an OpenShift Project can communicate with the internet

While this solution adds a zero-trust enforcement capability, it is still required to operate on top of the current OpenShift multi-tenant SDN. **No existing OpenShift components are being removed or modified in this process.**

## High-Level Rollout Process
The full description of the `install` option for the Aporeto ansible playbook can be found [here](build/ansible/readme.md). 

The short version of this is such that; 

  1. A set of **base policies** are rendered from environment specific variables (sepecified in *group_vars*) to allow proper communication to flow for OpenShift platform components, including the policies needed to support ingress routes. 
  2. OpenShift projects and Aporeto namespaces are created. 
  3. The Aporeto **operator** is deployed to start synchronizing OpenShift Projects -> Aporeto child namespaces
  4. **Base policies** are applied into the Aporeto namespace
  6. The **BCGov NetworkSecurityPolicy Operator** is deployed into OpenShift. 
  7. **Basic User Policies** are generated to allow *intra-namespace* and *egress-internet* communication, ensuring a matching experience with today's configuration. This process will take some time based on the number of policies that need to be created (~2* each namespace). 
  8. The **Basic User Policy** creation process is monitored - the playbook waits until this is done. 
  9. The Aporeto **enforcers** are deployed in enforcement mode. 

In the outlined process above, all policies that allow the correct communication flow are configured **prior** to the deployment of the enforcers. This process is fully automated with an Ansible playbook and does not require administrative intervention during the process. 

## New Process Adjustments
Once deployed, new projects that are created within OpenShift will not have **egress inernet** or **intra-namespace** communcation capabilities. This can either be automated (if desired) or development teams will need to create the desired policy when they are deploying their applications. 

## Roll-Out Timing
The Production rollout took place on **Oct 22, 2019**.

The specific day and time has not yet been determined, but it would be ideal to make this change at the beginning of a regular working day such that app teams can help report any issues or affects this has on their applications. Based on experience in the lab, the playbook **may** take up to 45 minutes to complete due to the # of policies that need to be created.

## Communication Plan
The production rollout plan been communicated to the end-user community through Rocketchat devops-alert channel and as part of the platform's status page. 



