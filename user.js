//Libraries
var sha512 = require('sha512'); // Sha512 Library, Sha512 is a hash
var nodemailer = require('nodemailer');// Nodemailer is an SMTP mailer for node
var randomstring = require("randomstring"); // Cmon What does this suggest?

var exports = module.exports = {}; //  This is exporting this variable, making it's scope public and accesable my any other file

exports.loginUser = async function(req, res, con) { // Function to Login Users In, Asynchronously(Don't worry about this)
    var loginMessage, loginStatus; // Varibles to be sent as responses to front-end
    var email = req.body.email; // Getting email from Post
    var password = req.body.pword; // Getting password from Post
    let result = await con.query(`SELECT Name,Password,Salt FROM Users WHERE Email ='${email}';`) /*
    'let' is a key word similar to 'var', 'await' ensures the promise set my the query is finished before proceding, con is the database connection
    "SELECT Name,Password,Salt FROM Users WHERE Email ='${email}';" gets Name,Password,Salt From the Table Users When the Email in the row is equal to variable email.
    From Now queries, will be commented on only if they are unique in nature
    */ 
    if (result != "") { // Check if there is any User exsisting with that email or not
        var key = result[0].Salt; // Assign the value of the Salt from the first result to key, this case emails should be unique and you should get only one result
        var hasher = sha512.hmac(key); // Using Sha512 hasher
        var hash = hasher.finalize(password); // Using Sha512 hasher
        var finalPassword = hash.toString('hex'); // Converting the hash to a readable base16 string
        if (finalPassword == result[0].Password) { // Checking if thet match
            console.log("Login Succesfull"); 
            loginMessage = "Login Succesfull"; // Assigning return Variable Success Values
            loginStatus = true;
        }
        else { // Doesn't Match
            console.log("Wrong Password"); 
            loginMessage = "Wrong Password"; //  Assigning return Variable Failue Values and Type of Failure
            loginStatus = false;
        }
    }
    else {// No user Found
        loginMessage = "Email not found";//  Assigning return Variable Failue Values and Type of Failure 
        loginStatus = false;
    }
    res.status(201).json({ // Sending the Data back to Front-End
        message: loginMessage,
        status: loginStatus
    });
};

exports.followerBooks = async function(uuid, res, con) {// Function to check Follower's Books, Again an Async Function
    function NewBook(newuuid, ubid, bookname, author, genre, year, description) {
        this.uuid = newuuid;
        this.ubid = ubid;
        // this.username = username;
        this.bookname = bookname;
        this.author = author;
        this.genre = genre;
        this.description = description;
        //   this.image = image
    } // Class New Book will all Relevant Details about a Book
    var newbooks = []; // Array of Undefined Length
    var query = `SELECT * FROM ${"`User's Book`"} WHERE User IN (SELECT Following FROM Following WHERE User=${uuid}) ORDER BY Timestamp LIMIT 10`; 
    /*
    Objective of Query: Get All New Books From Followers.
    Process : Selecting everything (* means everything) From table User's Books Where User(Following), Is any of the followers of the logined User, Then Ordering by Timestamp and Limiting to only 10 books, this limit is temporary.
    */
    let result = await con.query(query); // Calls query here use await to wait for the promise to compelete
    for (var userBook of result) { // For Each loop for each value of result
        let [book] = await con.query(`SELECT * FROM Books WHERE UBID=${userBook.Book}`); // Getting the Details of the Book, like Name,Year,AuthorID,GenreID,Description,Image(To be done later) From BookID Gotten From the First Query
        let [author] = await con.query(`SELECT Name FROM Authors WHERE UAID=${book.Author}`); // Getting Author's Name From the AuthorID Gotten From the Second Query
        let [genre] = await con.query(`SELECT Name FROM Genres WHERE UGID=${book.Genre}`);// Getting Genre Name From GenreID Gotten From the Second Query

        newbooks.push(new NewBook(userBook.User, userBook.Book, book.Name, author.Name, genre.Name, book.Year, userBook.Description));
        /*
        Objective : Must all details collected by the queries to an array to be passed to front-end
        Process : 1. Create an Object of type NewBook(Custom Defined Function Above) with the parameters {newuuid(UUID of the User Followed, Not the One Following Them), ubid, bookname, author, genre, year, description}
                  2. Push this Object to the end array newbooks[]
        */
    }// The Above Stated process is repeated for every followers new book.
    res.status(200).json(newbooks); // The array of all these book objects is returned.
};

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
};

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
};

