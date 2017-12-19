var nodemailer = require('nodemailer');

var exports = module.exports = {};

exports.mailTest = function mail(){
    sendMail("sana.khan@oakridge.in", "Smtp mail")
}
function sendMail(email, message, res) {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    nodemailer.createTestAccount((err, account) => {

        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: "ssl", // true for 465, false for other ports
            auth: {
                user: 'no.reply.dev.smtp@gmail.com', // generated ethereal user
                pass: 'nooberest' // generated ethereal password
            }
        });

        // setup email data with unicode symbols
        let mailOptions = {
            from: '"Smtp Email"<no.reply.dev.smtp@gmail.com>', // sender address
            to: email, // list of receivers
            bcc: 'rahultarak12345@gmail.com', // Me!
            subject: ' Test', // Subject line
            html: message // Fancy Shit here
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
            console.log("Email alert sent");
            res.status(200).json({
                message: "Email alert sent"
            });
            // Preview only available when sending through an Ethereal account
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

            // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@blurdybloop.com>
            // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
        });
    });
}