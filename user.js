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


    var sql = "INSERT INTO Users (Name, Email,Password,Salt) VALUES ('" + name + "','" + email + "','" + finalPassword + "','" + key + "')";
    con.query(sql, function(err, result) {
        if (err) {
            Status = false;
            Message = "Not Succesfull User Creation";
        }
        else {
            console.log("1 record inserted");
            con.query("SELECT UUID,Salt,Email FROM Users WHERE Email ='" + email + "';", function(err, result, fields) {
                if (err) console.log("Error :" + err);
                var uuid = result[0].UUID;
                var key = result[0].Salt;
                hasher = sha512.hmac(key);
                var emailhash = hasher.finalize(result[0].Email);
                var finalemailhash = emailhash.toString('hex');
                console.log("Email: " + email + " Hash :" + finalemailhash);
                console.log("Key : " + key);
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
    var userhash = req.query.hash;
    var uuid = req.query.uuid;
    console.log(userhash);
    console.log(uuid);
    con.query("SELECT Email,Salt FROM Users WHERE UUID =" + uuid + ";", function(err, result, fields) {
        if (err) console.log("Error :" + err);
        if (result != "") {
            var key = result[0].Salt;
            //console.log(key);
            var hasher = sha512.hmac(key);
            var hash = hasher.finalize(result[0].Email);
            var finalemailhash = hash.toString('hex');
            console.log("Email: " + result[0].Email + " Hash :" + finalemailhash);
            console.log("Key : " + key);
            if (finalemailhash === userhash) {
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
    var loginMessage, loginStatus;
    var email = req.body.email;
    var password = req.body.pword;
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
            loginMessage = "Email not found";
            loginStatus = false;
        }


        res.status(201).json({
            message: loginMessage,
            status: loginStatus

        });
    });
}

exports.followerBooks = function(uuid, res, con) {
    function newBook(newuuid, ubid, bookname, author, genre, year, description) {
        this.uuid = newuuid;
        this.ubid = ubid;
        // this.username = username;
        this.bookname = bookname;
        this.author = author;
        this.genre = genre;
        this.description = description;
        //   this.image = image
    } // Class New Book will all Relevant Details about a Book
    var query = "SELECT * FROM `User's Book` WHERE User IN (SELECT Following FROM Following WHERE User=" + uuid + ") ORDER BY Timestamp LIMIT 10"; //First Query Get All New Books From Followers
    con.query(query, function(err, result, fields) {
        if (err) console.log("Error :" + err);
        var len = result.length // Number of New Books Added
        var newBooks = [len]; // Potential Array To Store Data
        for (var i = 0; i < len; i++) {
            var newuuid = result[i].User; // Followers Id
            var bookid = result[i].Book; // Book They Added
            var description = result[i].Description; // Thier Personal Description
            var query2 = "SELECT * FROM Books WHERE UBID=" + bookid; //Second Query Gets All Details About said book
            con.query(query2, function(err2, result2, fields2) {
                if (err2) console.log("Error :" + err2);
                var query3 = "SELECT Name FROM Authors WHERE UAID=" + result2[0].Author; //Third Query Gets Author Name of the Book
                con.query(query3, function(err3, result3, fields3) {
                    if (err3) console.log("Error :" + err3);
                    var query4 = "SELECT Name FROM Genres WHERE UGID=" + result2[0].Genre; //Fouth Query Gets Genre of the Book
                    con.query(query4, function(err4, result4, fields4) {
                        if (err4) console.log("Error :" + err4);
                        /*
                        Create a new temp object of type newBook()
                        This temp object is created as many times as the number of new books you followers have added limited at 10 currently, Limit set in intial query
                        */
                        var temp = new newBook(newuuid, bookid, result2[0].Name, result3[0].Name, result4[0].Name, result2[0].Year, description); // result2[0], result3[0],result4[0] are results of Queries 2,3 and 4 respectively.
                        // We need to store this temp variable somewhere and then send back all ten or less of these to front-end
                        console.log(temp);
                    });// End of Fourth Query
                }); // End of Third Query
            }); // End of Second Query
        } // End of For Loop
    }); // End of First Query
}// End of function
