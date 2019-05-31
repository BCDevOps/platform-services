## Dashboard Updater
This ansible code is used to dynamically add markdown content from the files placed in `notifications/` into the status page dashboard. 

## Usage
Add a markdown file into `notificaitons/`: 
- Title the file with the date and time of the notice, such as `05-31-19-1055.md`
- Insert the notice as the body content 

## Jenkins Pipeline
Using a GitHub wwebhook as the trigger, a PR can start up the Jenkins pipeline which will run the anisble playbook and update the `grafana-dashboards` configmap in the namespace. 
This pipeline is written for use within OpenShift and would need to be modified for alternate environments as it assumes the presense of `oc` binary. This can be modified for kubernetes with a different pod template.  

[TODO]
This needs to be extended and paramaterized for multiple namespaces. 

### RocketChat Integration
A simple script is required on the incoming webhook for integration with Ansible. 

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