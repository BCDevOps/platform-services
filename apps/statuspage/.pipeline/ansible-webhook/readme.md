# ansible-webhook
This containerized application will run on OpenShift / Kubernetes and will: 
- Receive a GitHub Pull Request payload
- Run an Ansible playbook that: 
  - Gets the file contentfrom the PR
  - Close and merge the GitHub Pull Request

This is a sample flow only. 

## Webhook Configuration
The webhook service takes in a `hooks.json` or `hooks.yml` file. This is a single file that lists all hook configurations and defines: 
- The hook ID
- The scripts to run
- The parameters to pass to the scripts from the webhook payload
- The filters required to either admit or deny the webhook

The configuration used in this instance is as follows:
```
- id: webhook
  execute-command: /opt/run-playbook.sh
  command-working-directory: /opt
  response-message: I got the payload!
  pass-arguments-to-command:
  - source: payload
    name: pull_request.head.repo.html_url
  - source: payload
    name: pull_request.head.ref
  - source: payload
    name: number
  - source: payload
    name: pull_request.head.repo.owner.login
  - source: payload
    name: pull_request.url
  trigger-rule:
    and:
    - match:
        type: payload-hash-sha1
        secret: mysecret
        parameter:
          source: header
          name: X-Hub-Signature
    - match:
        type: value
        value: opened
        parameter:
          source: payload
          name: action
```

Based on the above configuration, we can call `https://{fqdn}/hooks/webhook` from GitHub. The filter will look for the secret `mysecret`, and the PR status as `opened`. 

When the script runs, we pass some data from the payload along into the ansible playbook as extra vars: 

```
#!/bin/bash
ansible-playbook playbook.yml -e repo_url=$1 -e branch=$2 -e pull_request_number=$3 -e repo_owner=$4 -e pull_request_url=$5 -e gh_token=$TOKEN
```

## Container Configuration
This code leverages the ansible operator container since it has the necessary components to easily run ansible. 


## GitHub Integration
The Ansible playbook interacts with GitHub to place API calls. This requires a GitHub Access token mounted as a secret at `/opt/creds/token`.
The sample playbook receives the webhook from GitHub, performs some work with the file content of the PR, and then merges and closes the PR. This is just sample functionality. 


# Acknowledgements 
- [webhook code](https://github.com/adnanh/webhook)
.
