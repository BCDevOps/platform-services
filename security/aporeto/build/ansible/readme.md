# Aporeto Playbook

### Usage
This playbook can be used to install or uninstall Aporeto in each BCGov OpenShift environment. 
*Note: Only a single operator and set of enforcers must exist in an OpenShift cluster. Multiple implementations with this playbook will cause failures* 

- Set the user credentials in environment variables
  - These credentials are used to generate a temporary token for the install/uninstall process
  ```
  export APOCTL_USER=myuser
  export APOCTL_PASSWORD=mypassword
  ```

- Review/modify the inventory group vars as appropriate: 
  - For the Lab environment edit the [group_vars](group_vars/lab.yml)
  - For the Prod environment edit the [group_vars](group_vars/prod.yml)

- Review/modify the general [vars.yml](vars.yml) file for accuracy

- Ensure the system running this playbook is already logged in with appropriate credentials to OpenShift
    - The user running this playbook bust had cluster-admin rights

- Run the playbook with the desired action
  - For installing the enforcers in the `lab`: 
    ```
    ansible-playbook -i lab aporeto.yml -e activity=install 
    ```
  - For removing the enforcers from the `lab`:
    ```
    ansible-playbook -i lab aporeto.yml -e activity=uninstall 
    ```


### Requirements
- Namespace Preparation
The parent namespace must exist prior to running this playbook. A separate playbook [WIP] controls all Aporeto namespace creation and access controls. 


- CLI tools
  - apoctl
  - helm


## Listing all Aporeto CRDs
In order to list Aporeto CRDs, run the following command: 

```
oc api-resources --api-group=api.aporeto.io -o name
```

## Todo
- [ ] Sort out labels on appcred or appcred cleanup
- [ ] Create test/error for existing namespace
- [ ] Add error handling around existing namespace
- [ ] Determine whether to remove Aporeto namespace when uninstalling
