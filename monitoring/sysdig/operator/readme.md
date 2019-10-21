## Sysdig Monitor Operator

Operator initilizalization with the oeprator-sdk: 

```
operator-sdk new sysdig-monitor --type ansible --kind Monitoring --api-version ops.gov.bc.ca/v1alpha1 --generate-playbook
```

## Development Approach
There is a python client if desired, found here: https://github.com/draios/python-sdc-client


We decided to leverage the native API with Ansible for building the Operator functions. 