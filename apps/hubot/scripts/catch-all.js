// Description:
//  Catch all unhandled messages directed to me.
//
// Notes:
//  If nothing else catches a message, it's mine!

module.exports = (robot) => {
    robot.catchAll((msg) => {
        const regexp  = new RegExp('^(@?' + robot.alias + ':?|' + robot.name + ')', 'i');
        const matches = msg.message.text.match(regexp);

        if (matches !== null && matches.length > 1) {
            msg.reply('I don\'t know what that means. Have you checked your syntax? Try `bcbot help` to see commands.');
            msg.finish();
        }
    });
};
