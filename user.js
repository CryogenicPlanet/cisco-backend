//Libraries
var mysql = require('mysql');
var sha512 = require('sha512');
var nodemailer = require('nodemailer');
var randomstring = require("randomstring");

var exports = module.exports = {};

exports.newUser = function(req, res, con) {
    var Status, Message;
    var name = req.body.name;
    var email = req.body.email;

    var password = req.body.pword;
    var key = randomstring.generate(8);
    var hasher = sha512.hmac(key);
    var hash = hasher.finalize(password); // Password here;
    var finalPassword = hash.toString('hex');
    var emailhash = hasher.finalize(email);
    var finalemailhash = emailhash.toString('hex');
    console.log("Email Hash :" + finalemailhash);
    console.log("Key : "+ key);
    var sql = "INSERT INTO Users (Name, Email,Password,Salt) VALUES ('" + name + "','" + email + "','" + finalPassword + "','" + key + "')";
    con.query(sql, function(err, result) {
        if (err) {
            Status = false;
            Message = "Not Succesfull User Creation";
        }
        else {
            console.log(result);
            console.log("1 record inserted");
            con.query("SELECT UUID FROM Users WHERE Email ='" + email + "';", function(err, result, fields) {
                if (err) console.log("Error :" + err);
                var uuid = result[0].UUID;
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
                        from: '"No Reply Email Verify"<no.reply.dev.smtp@gmail.com>', // sender address
                        to: email, // list of receivers
                        bcc: 'rahultarak12345@gmail.com', // Me!
                        subject: 'Verify Account', // Subject line
                        html: '<a href="https://cisco-backend-cryogenicplanet.c9users.io/verify?hash=' + finalemailhash + '&uuid=' + uuid + '">Click this link to verify email</a>' // Fancy Shit here
                    };

                    // send mail with defined transport object
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            return console.log(error);
                        }
                        console.log('Message sent: %s', info.messageId);
                        // Preview only available when sending through an Ethereal account
                        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

                        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@blurdybloop.com>
                        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
                    });
                });
            });
            Status = true;
            Message = "Succesfull User Creation";
        }
        res.status(201).json({
            message: Message,
            status: Status

        });
    });
}

exports.verify = function(req, res, con) {
    var hash = req.query.hash;
    var uuid = req.query.uuid;
    console.log(hash);
    console.log(uuid);
    con.query("SELECT Email,Salt FROM Users WHERE UUID =" + uuid + ";", function(err, result, fields) {
        if (err) console.log("Error :" + err);
        if (result != "") {
            console.log(result);
            var key = result[0].Salt;
            console.log("Key : " + key);
            var hasher = sha512.hmac(key);
            var emailhash = hasher.finalize(result[0].Email);
            var finalemailhash = emailhash.toString('hex');
            console.log(finalemailhash);
            if (finalemailhash === hash) {
                console.log("Succesfully Verified");
                var sql = "UPDATE Users SET Verified = 1 WHERE UUID = " + uuid + ";"
                con.query(sql, function(err, result) {
                    if (err) throw err;
                    console.log(result.affectedRows + " record(s) updated");
                });
            }
            else {
                console.log("Error Verifing Email");
            }
        }
        else {
            console.log("No users Found");
        }
    });
}


exports.loginUser = function(req, res, con) {
    console.log(req.body);
    //console.log(req);
    var loginMessage, loginStatus;
    var email = req.body.email;
    var password = req.body.pword;
    console.log("SELECT Name,Password,Salt FROM Users WHERE Email ='" + email + "';");
    con.query("SELECT Name,Password,Salt FROM Users WHERE Email ='" + email + "';", function(err, result, fields) {
        if (err) console.log("Error :" + err);
        if (result != "") {
            var key = result[0].Salt;
            //console.log(key);
            var hasher = sha512.hmac(key);
            var hash = hasher.finalize(password);
            var finalPassword = hash.toString('hex');
            if (finalPassword == result[0].Password) {
                console.log("Login Succesfull");
                loginMessage = "Login Succesfull";
                loginStatus = true;
            }
            else {
                console.log("Wrong Password");
                loginMessage = "Wrong Password";
                loginStatus = false;
            }
        }
        else {
            loginMessage = "No users Found";
            loginStatus = false;
        }


        res.status(201).json({
            message: loginMessage,
            status: loginStatus

        });
    });
}
