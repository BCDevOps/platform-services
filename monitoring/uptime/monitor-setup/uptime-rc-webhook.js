/**
 * uptime-rc-webhook.js
 * Add Uptime.com notifications via WebHook in Rocket.Chat
 */

/* globals console, _, s */
const USERNAME = 'Uptime.com Alerts';
const AVATAR_URL = 'https://avatars.githubusercontent.com/u/54849620?s=200&v=4';

/* exported Script */
class Script {
  /**
   * @params {object} request
   */
  process_incoming_request({ request }) {
    const data = request.content.data;
    // We are using Custom HTTP Headers to add user tagging information:
    const contactUser = request.headers.contactusers;

    let attachmentColor = `#A63636`;
    let statusText = `DOWN`;
    let isUp = data.alert.is_up;
    if (isUp) {
      attachmentColor = `#36A64F`;
      statusText = `UP`;
    }

    let attachmentText = '';
    let titleText = '';
    let titleLink = '';
    if (isUp) {
      attachmentText += 'Back to normal now!';
      titleText = 'More info';
      titleLink = 'https://uptime.com';
    } else {
      attachmentText += `Reason: ${data.alert.short_output}`;
      titleText = 'More info';
      titleLink = data.links.alert_details;
    }

    return {
      content:{
        alias: USERNAME,
        icon_url: AVATAR_URL,
        text: `${contactUser} Monitor ${data.service.name} is ${statusText}.\n Link: ${data.account.site_url}\n`,
        attachments: [{
          title: titleText,
          title_link: titleLink,
          text: attachmentText,
          color: attachmentColor
        }]
      }
    };
  }
}
