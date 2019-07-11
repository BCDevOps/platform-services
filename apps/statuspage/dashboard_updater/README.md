# Platform Services Status Page Notifications - Dashboard Updater
This folder contains: 
- The code required to re-generate the status page dashboard when updates are made

This folder does NOT contain: 
- The status update files (in markdown) used to populate the status page
  - This is located in the [platform-services-status-page-notifications](https://github.com/BCDevOps/platform-services-status-page-notifications) main repo

## Status Page Notifications
To post status page notifications, please see the repo mentioned above. This code is designed for actually rendering and updaring the dashboard code. 


# The Components

## The Ansible Playbook
The ansible playbook does most of the heavily lifting and is primarily responsible for the following tasks: 
- Generating the Grafana dashboard with Jijna2
- Populating the Markdown panel with all status updates in the `notifications` folder
- Sending an update to Rocket Chat with the latest update

## The Jenkinsfile
The Jenkinsfile is used with OpenShift to kick off the ansible playbook. The variables should be customized as desired. 

- Within the OpenShift tooling project, create the Pipeline BuildConfig
```
oc new-build [repo name] --context-dir=.pipeline
```

- The Jenkinsfile pipeline will use a cusotmized podTemplate with Ansible installed; it also mounts up a secret that must exist in the same namespace: 
  - Secret name: `rocketchat`
  - Secret type: `Opaque`
  - Secret Contents: 
    - key: token
      - content: RocketChat webhook token
    - key: username
      - content: displayname of the user posting the message

## The Jenkins Agent
The Jenkins Agent folder holds the Dockerfile used to build the Jenkins agent that has ansible installed on it. 

## RocketChat Integration
A simple script is required on the incoming webhook for integration with Ansible. 

```
class Script {
  process_incoming_request({ request }) {
   // console.log(request.content);

    return {
      content: {
        text: request.content.text,
        icon_url: request.content.icon_url,
        username: request.content.username
      }
    };
  }
}
```

## Grafyaml
Grafyaml is used to help with automation of the dashboards. Due to the latest release 0.0.7 not providing the a feature that is already in the master branch, this is cloned from source and installed manually on the installation host. 

```
git clone https://opendev.org/opendev/grafyaml.git
cd grafyaml/
./setup.py build 
sudo ./setup.py install
```

- Usage
```
grafana-dashboard  --grafana-url $GRAFANA_URL --grafana-apikey $GRAFANA_APIKEY validate  grafyaml.sample.yml
```

#### Known Issues
Grafyaml doesn't yet support all grafana features (see above where we are working off master and not off an official release). Other issues have come up that have workarounds: 
  - Can't invert the colors for thresholds
      - blackbox_exporter returns a "1" for success and "0" for failure. Typically we would invert the thresholds to have "green" on "1" and    "red" on "0". Since grafyaml doesn't support manually setting the colors (ie. we can't invert them), the expression is multiplied by    (-1) and the thresholds set to (-0.5,0) such that -1 registers "green" and 0 registers "red"

#### Resources
  - [https://docs.openstack.org/infra/grafyaml/grafana-dashboard.html](https://docs.openstack.org/infra/grafyaml/grafana-dashboard.html)
  - [https://opendev.org/opendev/grafyaml](https://opendev.org/opendev/grafyaml)
  - [https://opendev.org/openstack/project-config/src/branch/master/grafana](https://opendev.org/openstack/project-config/src/branch/master/grafana)