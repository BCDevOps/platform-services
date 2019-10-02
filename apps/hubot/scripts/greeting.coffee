# Description:
#   Greetings!
#
# Commands:
#   hello/hi, hubot - responds with a greeting. Comma optional.

module.exports = (robot) ->
  robot.hear /(hello,? bcbot|hi,? bcbot)/i, (res) ->
    res.send "Hello! I'm BCbot! You can find out what I do by typing `bcbot help`. I am able to listen to any channel, but if it's a private channel, you must add me to the channel or I can't respond! I can respond to DMs as well, so please feel free to use those to experiment with me. I hope to be very helpful :)"