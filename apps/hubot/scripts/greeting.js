// Description:
//    Greets BCBot.
//
// Commands:
//    hubot what time is it? - Tells you the time
//    hubot what's the time? - Tells you the time
//

module.exports = function(robot) {
  return robot.hear(/(hello,? bcbot|hi,? bcbot)/i, function(res) {
    return res.send("Hello! I'm BCbot! You can find out what I do by typing `bcbot help`. I am able to listen to any channel, but you must add me to the channel or I can't respond! I can respond to DMs as well, so please feel free to use those to experiment with me. I hope to be very helpful :)");
  });
};
