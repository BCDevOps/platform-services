// Description:
//  Default error handler.
//
// Notes:
//  If nothing else catches the error, it's mine!

module.exports = (robot) => {
    robot.error((err, res) => {
        // If there is a response, reply
        console.log(res);
        if (res !== null && res !== undefined) {
            res.reply(`Oops, and that's an error: ${err.message}`);
        }

        let errorMessage = `ERROR:\n`;
        if (err.stack !== null) {
            errorMessage += err.stack;
        } else {
            errorMessage += err.toString();
        }

        // Log system error
        robot.logger.error(errorMessage);

        // Prepare adapter message
        errorMessage = errorMessage.split('\n').map((line) => {
            return '    ' + line;
        }).join('\n');

        // Send system error
        //robot.adapter.client.send({room: 'server-log'}, errorMessage);
        robot.messageRoom('server-log', errorMessage);
    });
};
