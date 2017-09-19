//Environment Variables
var port = process.env.PORT;

//Libraries
var getenv = require('getenv');
var mysql = require('mysql');
var sha512 = require('sha512');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
//Server
var express = require('express');
var app = express();

app.use(bodyParser.json());

var server = app.listen(port);

    /*  Use for user generation 
        var key = ""//Salt here;
        var hasher = sha512.hmac(key);
        var hash = hasher.finalize("")// Password here;
        console.log( hash.toString('hex')); */
var con = mysql.createConnection({
  host: getenv('IP'),
  user: getenv('C9_USER'),
  password: "",
  database: "c9"
});
con.connect(function(err) {

  if (err)  console.log("Error :" + err);
  else console.log("Successful Db Con");
});
// HTTP Requests
app.post('/login', function(req, res) {
    console.log(req.body);
    var loginMessage,loginStatus;
    // Here is the problem
    var email = req.body.email;
    var password = req.body.pword;
    con.query("SELECT Name,Password,Salt FROM Users WHERE Email ='" + email + "';" , function (err, result, fields) {
        if (err)  console.log("Error :" + err);
        var key = result[0].Salt;
        console.log(key);
        var hasher = sha512.hmac(key);
        var hash = hasher.finalize(password);
        var finalPassword = hash.toString('hex');
        if(finalPassword == result[0].Password){
            console.log("Login Succesfull");
            loginMessage = "Login Succesfull";
            loginStatus = true; 
        } else {
            console.log("Wrong Password");
            loginMessage = "Wrong Password";
            loginStatus = false;
        }
        res.status(201).json({
            message : loginMessage,
            status : loginStatus
            
        });
    });
  
});
