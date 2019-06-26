# Ansible Runner with Webhook
Thsi container image is based on the ansible operator and includes a [webhook service](https://github.com/adnanh/webhook) to remotely execute the playbooks. 

This image is tested in kubernetes / OpenShift. 

## Resources

- secrets
  - token - mounted at /opt/creds/token - GitHub Access Token
- configMap
  - required - mounted at /opt/hooks/ - One single hook config file
- route
  - required - for external access to the service - Can use multilple TLS options


# Resources
- GitHub Payload Example
https://gist.github.com/gjtorikian/5171861
- GitHub Webhook Docs
https://developer.github.com/webhooks/
- PR Event
https://developer.github.com/v3/activity/events/types/#pullrequestevent


# Acknowledgements
https://github.com/adnanh/webhook