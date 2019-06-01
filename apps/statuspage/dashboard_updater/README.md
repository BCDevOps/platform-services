


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