// Description:
//   Remind to someone something
//
// Commands:
//   hubot show reminders - Show active reminders
//   hubot delete reminder owner: (username) action: (action) - Remove a given reminder, queried by the reminder message.
//   hubot remind me in 5 h to (reminder) - remind me to do something in 5 hours. Replace the h with an m for minutes or d for days.
//   hubot remind me on Sept 5 at 10:00 to (reminder) - remind me to do something at a specific date and time.
//   hubot remind (username) in 1 day to (reminder) - remind someone else to do something in 1 day. Substitute "minute(s)" or "hour(s)" as appropriate.
//   hubot remind (username) on today at 3pm to (reminder) - remind someone else to do something at 3pm today.
//
//


let _ = require('lodash');
let moment = require('moment');
let chrono = require('chrono-node');

let timeoutIds = {};

let Reminders = (function() {
  function Reminders(_at_robot) {
    this.robot = _at_robot;
    this.cache = [];
    this.currentTimeout = null;
    this.robot.brain.on('loaded', (function(_this) {
      return function() {
        if (_this.robot.brain.data.reminders) {
          _this.cache = _.map(_this.robot.brain.data.reminders, function(item) {
            return new Reminder(item);
          });
          console.log("loaded " + _this.cache.length + " reminders");
          return _this.queue();
        }
      };
    })(this));
    this.robot.brain.on('save', (function(_this) {
      return function() {
        return _this.robot.brain.data.reminders = _this.cache;
      };
    })(this));
  }

  Reminders.prototype.add = function(reminder) {
    this.cache.push(reminder);
    this.cache.sort(function(a, b) {
      return a.due - b.due;
    });
    return this.queue();
  };

  Reminders.prototype.removeFirst = function() {
    var reminder;
    reminder = this.cache.shift();
    return reminder;
  };

  Reminders.prototype.queue = function() {
    var duration, extendTimeout, now, reminder, trigger;
    if (this.cache.length === 0) {
      return;
    }
    now = (new Date).getTime();
    trigger = (function(_this) {
      return function() {
        let reminder = _this.removeFirst();

        // reminder.msg_envelope.user.room = reminder.room;
        // reminder.msg_envelope.user.roomID = reminder.roomID;
        // reminder.msg_envelope.user.name = reminder.username;
        let envelope = {
                          room: reminder.room,
                          user: {
                            name: reminder.username,
                            roomID: reminder.roomID,
                            room: reminder.room
                          },
                          message: {
                            user: {
                              name: reminder.username,
                              roomID: reminder.roomID,
                              room: reminder.room
                            },
                            done: false,
                            room: reminder.room,
                            text: reminder.msg_envelope.message.text,
                            id: reminder.msg_envelope.message.id
                          }
                        };


        _this.robot.send(envelope, '@' + reminder.username + ' - reminder to ' + reminder.action);
        return _this.queue();
      };
    })(this);
    extendTimeout = function(timeout, callback) {
      if (timeout > 0x7FFFFFFF) {
        return setTimeout(function() {
          return extendTimeout(timeout - 0x7FFFFFFF, callback);
        }, 0x7FFFFFFF);
      } else {
        return setTimeout(callback, timeout);
      }
    };
    reminder = this.cache[0];
    duration = reminder.due - now;
    if (duration < 0) {
      duration = 0;
    }
    clearTimeout(timeoutIds[reminder]);
    timeoutIds[reminder] = extendTimeout(reminder.due - now, trigger);
    return console.log("reminder set with duration of " + duration);
  };

  return Reminders;

})();

Reminder = (function() {
  function Reminder(data) {
    var matches, pattern, period, periods;

    this.msg_envelope = data.msg_envelope,
        this.roomID = data.roomID,
        this.username = data.username,
        this.action = data.action,
        this.time = data.time,
        this.due = data.due;

    if (this.time && !this.due) {
      this.time.replace(/^\s+|\s+$/g, '');
      periods = {
        weeks: {
          value: 0,
          regex: "weeks?|week?|w"
        },
        days: {
          value: 0,
          regex: "days?|day?|d"
        },
        hours: {
          value: 0,
          regex: "hours?|hrs?|hour?|hr?|h"
        },
        minutes: {
          value: 0,
          regex: "minutes?|mins?|minute?|min?|m"
        },
        seconds: {
          value: 0,
          regex: "seconds?|secs?|sec|s"
        }
      };
      for (period in periods) {
        pattern = new RegExp('^.*?([\\d\\.]+)\\s*(?:(?:' + periods[period].regex + ')).*$', 'i');
        matches = pattern.exec(this.time);
        if (matches) {
          periods[period].value = parseInt(matches[1]);
        }
      }
      this.due = (new Date).getTime();
      this.due += ((periods.weeks.value * 604800) + (periods.days.value * 86400) + (periods.hours.value * 3600) + (periods.minutes.value * 60) + periods.seconds.value) * 1000;
    }
  }

  Reminder.prototype.formatDue = function() {
    var dueDate, duration;
    dueDate = new Date(this.due);
    duration = dueDate - new Date;
    if (duration > 0 && duration < 86400000) {
      return 'in ' + moment.duration(duration).humanize();
    } else {
      return 'on ' + moment(dueDate).format("dddd, MMMM Do YYYY, h:mm:ss a");
    }
  };

  return Reminder;

})();

module.exports = function(robot) {

  let reminders = new Reminders(robot);

  robot.respond(/show reminders$/i, function(msg) {
    let reminder, _i, _len;
    let text = '';
    let _ref = reminders.cache;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      reminder = _ref[_i];
      text += reminder.username + ": " + reminder.action + " " + reminder.formatDue() +  "\n";
    }
    return msg.send(text);
  });

  robot.respond(/delete reminder owner: (.+) action: (.+)$/i, function(msg) {
    let user_query = msg.match[1];
    let action_query = msg.match[2];
    let prevLength = reminders.cache.length;
    reminders.cache = _.reject(reminders.cache, {
      action: action_query,
      username: user_query
    });
    reminders.queue();
    if (reminders.cache.length !== prevLength) {
      return msg.send("Deleted " + user_query + "'s reminder, " + action_query);
    }
  });

  return robot.respond(/(remind )(.*) (in|on|tomorrow|today) (.*)to (.*)/i, function(msg) {
    let due, options, reminder;
    let who = msg.match[2];
    let type = msg.match[3];
    let time = msg.match[4];
    let action = msg.match[5];

    let name = msg.envelope.user.name;

    if (who !== 'me') {
      name = who.replace('@', '');
    }

    options = {
      msg_envelope: msg.envelope,
      action: action,
      time: time,
      roomID: msg.envelope.user.roomID,
      room: msg.envelope.room,
      username: name,
    };

    if (type === 'on') {
      due = chrono.parseDate(time).getTime();
      if (due.toString() !== 'Invalid Date') {
        options.due = due;
      }
    } else if (type === 'tomorrow') {
      due = chrono.parseDate('tomorrow ' + time).getTime();
      if (due.toString() !== 'Invalid Date') {
        options.due = due;
      }
    } else if (type === 'today') {
      due = chrono.parseDate('today ' + time).getTime();
      if (due.toString() !== 'Invalid Date') {
        options.due = due;
      }
    }
    reminder = new Reminder(options);
    reminders.add(reminder);
    return msg.send("I'll remind " + name + " to " + action + " " + (reminder.formatDue()));
  });
};
