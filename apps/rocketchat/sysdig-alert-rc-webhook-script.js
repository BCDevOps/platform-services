class Script {
    process_incoming_request({ request }) {
      console.log(request.content);
  
      var date = new Date(request.content.timestamp);
      
      var alertColor = "warning";
  
      if(request.content.resolved === "true"){ alertColor = "good"; }
      else if (request.content.state === "ACTIVE") { alertColor = "danger"; }
      return {
        content: {
          icon_url: "https://findicons.com/files/icons/2770/ios_7_icons/128/engine.png",
          text: "Sysdig Notification",
          attachments: [{
            title: request.content.alert.name,
            pretext: request.content.alert.description,
            title_link: request.content.event.url,
            color: alertColor,
            fields: [
              {
                title: "State",
                value: request.content.state
              },
              {
                title: "Condition",
                value: request.content.condition
              },
              {
                title: "Scope",
                value: request.content.alert.scope
              }
            ]
        }]
        }
      };
    }
  }
