class Script {
  /**
   * @params {object} request
   */
  process_incoming_request({ request }) {
    let data = request.content;
    let user = data.push_data.pusher
    let tag = data.push_data.tag
    let url = data.repository.repo_url
    let imageName = data.repository.repo_name
    let msg = `**[${imageName}:${tag}](${url})**\n_posted by ${user}_`
    return {
      content:{
        text: msg,
        attachments: []
      }
    };
  }
}