var nodemailer = require('nodemailer');
var exports = module.exports = {};

exports.borrowBooks = async function(req, res, con) {
    var lender = {
        Id : req.body.lender
    }
    var borrower = {
        Id : req.body.borrower
    }
    var ubid = req.body.ubid;
    let isOutstanding = checkoutstanding(borrower.Id,con);
    if (isOutstanding < 4) {
        let users = await con.query(`SELECT UUID,Email,Name FROM Users WHERE UUID=${lender.Id} or UUID=${borrower.Id}`);
        for(var user of users){
            if(user.UUID == lender.Id){
                lender["Name"] = user.Name;
                lender["Email"] = user.Email;
            } else {
                borrower["Name"] = user.Name;
                borrower["Email"] = user.Email;
            }
        }
        var message = ""; //html goes here
        if(sendMail(lender.Email,message)==true){
            console.log("Email alert sent");
        }
    }
}

var checkoutstanding = async function(borrower, con) {
    var isOutstanding = 0;
    let outstanding = await con.query(`SELECT Outstanding FROM Borrowed WHERE Borrower=${borrower}`);
    for (var outstander of outstanding) {
        if (outstander.outstanding != 0) {
            isOutstanding += 1;
        }
    }
    return isOutstanding;
}

function sendMail(email, message) {
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
            from: '"Verify Email"<no.reply.dev.smtp@gmail.com>', // sender address
            to: email, // list of receivers
            bcc: 'rahultarak12345@gmail.com', // Me!
            subject: 'Verify Account', // Subject line
            html: message // Fancy Shit here
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
            return true;
            // Preview only available when sending through an Ethereal account
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

            // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@blurdybloop.com>
            // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
        });
    });
}
