## Purpose
This playbook will take some simple input on the `vars.yml` to time the pod startup time for an image with various cpu and memory `request` and `limit` configurations. This will produce a `results.csv` output file containing the resource configuration and the application startup time in `seconds`. 

## Requirements

- A logged in user with admin access to the namespace that the test pods will be deployed to
- Pip: 
  ```
  pip install openshift --user
  ```

## Usage
- Edit `vars.yml` as appropriate: 
  - Change the image, namespace, and readiness check details
  - Change the various resource configurations that are desired for the test runs
  - Modify the # of tests to perform for each resource configuration

- Run the playbook: `anisble-playbook main.yml`

### Assumptions & Advanced Modifications
This playbook assumes an httpcheck as the readiness probe and has some hardcoded timout values for both the readiness probe and the time it may take to create the object. Feel free to edit `templates/pod.yml.j2` as required. 

