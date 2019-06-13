class Script {
  process_incoming_request({ request }) {
    return {
      content:{
        text: JSON.stringify(request.content),
        attachments: []
      }
    };
  }
}