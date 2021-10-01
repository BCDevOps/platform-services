// Description:
//   A script that expands mentions of groups. Groups themselves can be used as
//   members if prepended with '&', and mentions will be expanded recursively.
//
// Configuration:
//   HUBOT_GROUP_DECORATOR - a character indicating how to decorate usernames.
//     Valid settings are '<', '(', '[', and '{'. This variable can also be left
//     unset. This setting defaults to ''.
//   HUBOT_GROUP_PREPEND - set to 'false' to disable prepending the original
//     message to the response. This variable can also be left unset. This
//     setting defaults to 'true'.
//   HUBOT_GROUP_PREPEND_USERNAME - set to 'false' to disable prepending the
//     original username to the prepended message. This variable can also be
//     left unset. This setting defaults to 'true'.
//   HUBOT_GROUP_TRUNCATE - number of characters from the original message to
//     display when HUBOT_GROUP_PREPEND is set. Set to a value less than or
//     equal to zero to disable truncating. This setting defaults to '50'.
//   HUBOT_GROUP_RECURSE - set to 'false' to disable recursive group expansion.
//     The setting defaults to 'true'.
//
// Commands:
//   hubot group list - list all group names.
//   hubot group dump - list all group names and members.
//   hubot group create (group-name) - create a new group.
//   hubot group destroy (group-name) - destroy a group.
//   hubot group rename (old-group-name) (new-group-name) - rename a group.
//   hubot group add (group-name) (username) - add a user to a group.
//   hubot group remove (group-name) (username) - remove a user from a group.
//   hubot group info (group-name) - list members in group.
//   hubot group membership (username) - list groups that a user belongs to.
//
// Author:
//   anishathalye
//   caggles (update to javascript from coffeescript)
//

let __bind = function(fn, me) { return function(){return fn.apply(me, arguments);};},
  __indexOf = [].indexOf || function(item) {for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
  __hasProp = {}.hasOwnProperty;

let IDENTIFIER = "[-._a-zA-Z0-9]+";

let sorted = function(arr) {
  var copy, i;
  copy = (function() {
    var _i, _len, _results;
    _results = [];
    for (_i = 0, _len = arr.length; _i < _len; _i++) {
      i = arr[_i];
      _results.push(i);
    }
    return _results;
  })();
  return copy.sort();
};

let Group = (function() {
  function Group(_at_robot) {
    this.robot = _at_robot;
    this.membership = __bind(this.membership, this);
    this.remove = __bind(this.remove, this);
    this.add = __bind(this.add, this);
    this.rename = __bind(this.rename, this);
    this.destroy = __bind(this.destroy, this);
    this.create = __bind(this.create, this);
    this.exists = __bind(this.exists, this);
    this.groups = __bind(this.groups, this);
    this.members = __bind(this.members, this);
    this.load = __bind(this.load, this);
    this.cache = {};
    this.robot.brain.on("loaded", this.load);
    if (this.robot.brain.data.users.length) {
      this.load();
    }
  }

  Group.prototype.load = function() {
    if (this.robot.brain.data.group) {
      return this.cache = this.robot.brain.data.group;
    } else {
      return this.robot.brain.data.group = this.cache;
    }
  };

  Group.prototype.members = function(group) {
    return sorted(this.cache[group] || []);
  };

  Group.prototype.groups = function() {
    return sorted(Object.keys(this.cache));
  };

  Group.prototype.exists = function(group) {
    return this.cache[group] != null;
  };

  Group.prototype.create = function(group) {
    if (this.exists(group)) {
      return false;
    } else {
      this.cache[group] = [];
      return true;
    }
  };

  Group.prototype.destroy = function(group) {
    var mem;
    if (this.exists(group)) {
      mem = this.members(group);
      delete this.cache[group];
      return mem;
    } else {
      return null;
    }
  };

  Group.prototype.rename = function(from, to) {
    if ((!this.exists(from)) || (this.exists(to))) {
      return false;
    } else {
      this.cache[to] = this.cache[from];
      delete this.cache[from];
      return true;
    }
  };

  Group.prototype.add = function(group, name) {
    if (!this.exists(group)) {
      return false;
    }
    if (__indexOf.call(this.cache[group], name) >= 0) {
      return false;
    } else {
      this.cache[group].push(name);
      return true;
    }
  };

  Group.prototype.remove = function(group, name) {
    var idx;
    if (!this.exists(group)) {
      return false;
    }
    if (__indexOf.call(this.cache[group], name) >= 0) {
      idx = this.cache[group].indexOf(name);
      this.cache[group].splice(idx, 1);
      return true;
    } else {
      return false;
    }
  };

  Group.prototype.membership = function(name) {
    var group, groups, names, _ref;
    groups = [];
    _ref = this.cache;
    for (group in _ref) {
      if (!__hasProp.call(_ref, group)) continue;
      names = _ref[group];
      if (__indexOf.call(names, name) >= 0) {
        groups.push(group);
      }
    }
    return groups;
  };

  return Group;

})();

module.exports = function(robot) {
  var decorate, group;
  group = new Group(robot);
  decorate = function(name) {
        return "@" + name;
  };
  robot.hear(RegExp("@" + IDENTIFIER), function(res) {
    var decorateOnce, decorated, g, i, mem, message, name, process, response, tagged, text, truncate, _i, _j, _k, _len, _len1, _len2, _ref, _ref1;
    response = [];
    tagged = [];
    _ref = group.groups();
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      g = _ref[_i];
      if (RegExp("(^|\\s)@" + g + "\\b").test(res.message.text)) {
        tagged.push(g);
      }
    }
    process = (function() {
      var _j, _len1, _results;
      _results = [];
      for (_j = 0, _len1 = tagged.length; _j < _len1; _j++) {
        i = tagged[_j];
        _results.push(i);
      }
      return _results;
    })();
    while (process.length > 0) {
      g = process.shift();
      _ref1 = group.members(g);
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        mem = _ref1[_j];
        if (mem[0] === '&') {
          mem = mem.substring(1);
          if (__indexOf.call(process, mem) < 0 && __indexOf.call(tagged, mem) < 0) {
            tagged.push(mem);
            process.push(mem);
          }
        }
      }
    }
    decorated = {};
    decorateOnce = function(name) {
      if (name[0] === '&' || decorated[name]) {
        return name;
      } else {
        decorated[name] = true;
        return decorate(name);
      }
    };
    for (_k = 0, _len2 = tagged.length; _k < _len2; _k++) {
      g = tagged[_k];
      mem = group.members(g);
      if (mem.length > 0) {
        response.push("*@" + g + "*: " + (((function() {
          var _l, _len3, _results;
          _results = [];
          for (_l = 0, _len3 = mem.length; _l < _len3; _l++) {
            name = mem[_l];
            _results.push(decorateOnce(name));
          }
          return _results;
        })()).join(", ")));
      }
    }
    if (response.length > 0) {

        truncate = parseInt('300');
        text = res.message.text;
        message = truncate > 0 && text.length > truncate ? text.substring(0, truncate) + " [...]" : text;

        message = res.message.user.name + ": " + message;

        response.unshift(message);

      return res.send(response.join("\n"));
    }
  });
  robot.respond(/group\s+list/, function(res) {
    return res.send("Groups: " + (group.groups().join(", ")));
  });
  robot.respond(/group\s+dump/, function(res) {
    var g, response, _i, _len, _ref;
    response = [];
    _ref = group.groups();
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      g = _ref[_i];
      response.push("*@" + g + "*: " + (group.members(g).join(", ")));
    }
    if (response.length > 0) {
      return res.send(response.join("\n"));
    } else {
      return res.send("No groups exist.");
    }
  });
  robot.respond(RegExp("group\\s+create\\s+(" + IDENTIFIER + ")"), function(res) {
    var name;
    name = res.match[1];
    if (group.create(name)) {
      return res.send("Created group " + name + ".");
    } else {
      return res.send("Group " + name + " already exists!");
    }
  });
  robot.respond(RegExp("group\\s+destroy\\s+(" + IDENTIFIER + ")"), function(res) {
    var name, old;
    name = res.match[1];
    old = group.destroy(name);
    if (old !== null) {
      return res.send("Destroyed group " + name + " (" + (old.join(", ")) + ").");
    } else {
      return res.send("Group " + name + " does not exist!");
    }
  });
  robot.respond(RegExp("group\\s+rename\\s+(" + IDENTIFIER + ")\\s+(" + IDENTIFIER + ")"), function(res) {
    var from, to;
    from = res.match[1];
    to = res.match[2];
    if (group.rename(from, to)) {
      return res.send("Renamed group " + from + " to " + to + ".");
    } else {
      return res.send("Either group " + from + " does not exist or " + to + " already exists!");
    }
  });
  robot.respond(RegExp("group\\s+add\\s+(" + IDENTIFIER + ")\\s+@?(" + IDENTIFIER + "(?:\\s+@?" + IDENTIFIER + ")*)"), function(res) {
    var g, name, names, response, _i, _len;
    g = res.match[1];
    names = res.match[2];
    names = names.split(/\s+@?/);
    if (!group.exists(g)) {
      res.send("Group " + g + " does not exist!");
      return;
    }
    response = [];
    for (_i = 0, _len = names.length; _i < _len; _i++) {
      name = names[_i];
      if (group.add(g, name)) {
        response.push(name + " added to group " + g + ".");
      } else {
        response.push(name + " is already in group " + g + "!");
      }
    }
    return res.send(response.join("\n"));
  });
  robot.respond(RegExp("group\\s+remove\\s+(" + IDENTIFIER + ")\\s+@?(" + IDENTIFIER + "(?:\\s+@?" + IDENTIFIER + ")*)"), function(res) {
    var g, name, names, response, _i, _len;
    g = res.match[1];
    names = res.match[2];
    names = names.split(/\s+@?/);
    if (!group.exists(g)) {
      res.send("Group " + g + " does not exist!");
      return;
    }
    response = [];
    for (_i = 0, _len = names.length; _i < _len; _i++) {
      name = names[_i];
      if (group.remove(g, name)) {
        response.push(name + " removed from group " + g + ".");
      } else {
        response.push(name + " is not in group " + g + "!");
      }
    }
    return res.send(response.join("\n"));
  });
  robot.respond(RegExp("group\\s+info\\s+(" + IDENTIFIER + ")"), function(res) {
    var name;
    name = res.match[1];
    if (!group.exists(name)) {
      res.send("Group " + name + " does not exist!");
      return;
    }
    return res.send("*@" + name + "*: " + ((group.members(name)).join(", ")));
  });
  return robot.respond(RegExp("group\\s+membership\\s+@?(" + IDENTIFIER + ")"), function(res) {
    var groups, name;
    name = res.match[1];
    groups = group.membership(name);
    if (groups.length > 0) {
      return res.send(name + " is in " + (group.membership(name).join(", ")) + ".");
    } else {
      return res.send(name + " is not in any groups!");
    }
  });
};

