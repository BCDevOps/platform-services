# Aporeto Playbook

### Usage

- Set the user credentials in environment variables

```
export APOCTL_USER=myuser
export APOCTL_PASSWORD=mypassword
export APOCTL_NAMESPACE=/bcgov-devex
export BASE_ENV=lab-test
```

- Ensure the system running this playbook is already logged in with appropriate credentials to OpenShift


### Requirements
- CLI tools
  - apoctl
  - helm


## Todo
- [ ] Sort out labels on appcred or appcred cleanup
- [ ] Create test/error for existing namespace
