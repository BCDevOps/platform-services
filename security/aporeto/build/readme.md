# Aporeto Build Docs and Resources

## Ansible Playbook
The [ansible](ansible/readme.md) directory contains a playbook to: 
- Install Aporeto
- Uninstall Aporeto
- Configure Aporeto base policies

## Namespaces 
Aporeto and OpenShift/Kuberenetes both usee the concept of `namespaces`. This table is used to map an Aporeto `namespace` to an OpenShift `namespace`, as they are not the same thing. 

The following OpenShift namespaces are used for each configured environment: 

| OpenShift Environment Name | OpenShift Project                | Aporeto Namespace Mapping |   |   |
|----------------------------|----------------------------------|---------------------------|---|---|
| LAB                        | devops-platform-security-aporeto | /bcgov-devex/lab          |   |   |
|                            |                                  |                           |   |   |
|                            |                                  |                           |   |   |


## Legacy Docs 
The following docs were used for initial testing / deployment / playbook creation and are currently kept for historical reasons. 
- Build Documents
  - [Deployment Steps](deployment.md)