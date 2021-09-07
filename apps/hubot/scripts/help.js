'use strict';

// Description:
//   Generates help commands for Hubot.
//
// Commands:
//   hubot help - Displays all of the help commands that this bot knows about.
//   hubot help (query) - Displays all help commands that match (query).
//
// Configuration:
//   HUBOT_HELP_REPLY_IN_PRIVATE - if set to any avlue, all `hubot help` replies are sent in private
//   HUBOT_HELP_HIDDEN_COMMANDS - comma-separated list of commands that will not be displayed in help
//
// Notes:
//   These commands are grabbed from comment blocks at the top of each file.

/* global renamedHelpCommands */
const fs = require('fs');
const HUBOT_DOCUMENTATION_SECTIONS = ['description', 'dependencies', 'configuration', 'commands', 'notes', 'author', 'authors', 'examples', 'tags', 'urls']


module.exports = (robot) => {
  const replyInPrivate = process.env.HUBOT_HELP_REPLY_IN_PRIVATE;

  robot.respond(/help(?:\s+(.*))?$/i, (msg) => {

    const robotName = robot.alias || robot.name;
    const path = "./scripts";
    const filter = msg.match[1];

    let message = "";

    let files = fs.readdirSync(path).sort();
    for (let i = 0; i < files.length; i++) {

      let helpCommands = parseHelp(path + '/' + files[i]);

      helpCommands = helpCommands.map((command) => {
        if (robotName.length === 1) {
          return command.replace(/^hubot\s*/i, robotName)
        }
        return command.replace(/^hubot/i, robotName)
      });
      helpCommands = helpCommands.map((command) => {
        let commandlist = command.split(" - ");
        commandlist[0] = '* `' + commandlist[0] + '`';
        return commandlist.join(" - ");
      });

      if (filter) {
        helpCommands = helpCommands.filter(cmd => cmd.match(new RegExp(filter, 'i')));
      }

      let commandSetName = files[i].slice(0, files[i].length - 3);

      if (helpCommands.length >= 1) {
        message += "**" + commandSetName + "**\n";
        message += helpCommands.join('\n');
        message += "\n---\n";
      }
    }

    if (replyInPrivate && msg.message && msg.message.user && msg.message.user.name) {
      msg.reply('replied to you in private!');
      return robot.send({ room: msg.message.user.name }, message)
    } else {
      return msg.send(message)
    }

  });
};

let parseHelp = function parseHelp (path) {
  const body = fs.readFileSync(path, 'utf-8');
  let commands = [];

  const useStrictHeaderRegex = /^["']use strict['"];?\s+/;
  const lines = body.replace(useStrictHeaderRegex, '').split(/(?:\n|\r\n|\r)/)
    .reduce(toHeaderCommentBlock, {lines: [], isHeader: true}).lines
    .filter(Boolean); // remove empty lines
  let currentSection = null;
  let nextSection;

  for (let i = 0, line; i < lines.length; i++) {
    line = lines[i];

    if (line.toLowerCase() === 'none') {
      continue;
    }

    nextSection = line.toLowerCase().replace(':', '');
      if (Array.from(HUBOT_DOCUMENTATION_SECTIONS).indexOf(nextSection) !== -1) {
        currentSection = nextSection;
      } else {
        if (currentSection === 'commands') {
          commands.push(line)
        }
      }
  }
  return commands;
};

function toHeaderCommentBlock (block, currentLine) {
  if (!block.isHeader) {
    return block
  }

  if (isCommentLine(currentLine)) {
    block.lines.push(removeCommentPrefix(currentLine))
  } else {
    block.isHeader = false
  }

  return block
}

function isCommentLine (line) {
  return /^(#|\/\/)/.test(line)
}

function removeCommentPrefix (line) {
  return line.replace(/^[#/]+\s*/, '')
}
