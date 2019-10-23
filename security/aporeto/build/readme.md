# Aporeto Build Docs and Resources

## Ansible Playbook
The [ansible](ansible/readme.md) directory contains a playbook to: 
- Install Aporeto
- Uninstall Aporeto
- Configure Aporeto base policies
- Configure per-project basic policies for cut-in

## Namespaces 
Aporeto and OpenShift/Kuberenetes both usee the concept of `namespaces`. This table is used to map an Aporeto `namespace` to an OpenShift `namespace`, as they are not the same thing. 

Please refer to the [Architecture Design Decisions](../architecture/design_decisions.md) for the list of Aporeto namespaces and how they apply to the BCGov .

## Legacy Docs 
The following docs were used for initial testing / deployment / playbook creation and are currently kept for historical reasons. 
- Build Documents
  - [Deployment Steps](deployment.md)