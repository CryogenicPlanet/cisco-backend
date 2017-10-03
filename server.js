//Environment Variables
var port = process.env.PORT;

//Libraries
var getenv = require('getenv'); // Library for Enviroment Variables, Used for Db Conn
var mysql = require('promise-mysql'); // Mysql Library, With Node Promises
var sha512 = require('sha512'); // Sha512 Library, Sha512 is a hash
var bodyParser = require('body-parser'); // Library for parsing data
var jsonParser = bodyParser.json(); // Using Data type Json
var cors = require("cors"); // Library for handling access headers
//Modules
var user = require("./user.js"); // Object of our module User.js
var borrow = require("./borrow.js") // Object of our module Borrow.js
//Server Don't worry about this
var express = require('express'); // Framework for Node
var app = express();
app.use(express.logger());
app.use(cors());
app.use(bodyParser.json());
var server = app.listen(port);


//DataBase connection using promises
var con = null; 
mysql.createConnection({
    host: getenv('IP'),
    user: getenv('C9_USER'),
    password: "",
    database: "c9"
}).then(function(connection) { con = connection });
/* Old redudant Db Connection Code
 con.connect(function(err) {

     if (err) console.log("Error :" + err);
else console.log("Successful Db Con");
 }); */

/*HTTP Request Handling
Handle the request send for data or pages from front-end, browser, user below
*/
//Handling Requests of type POST, used to send Data to the server or database
app.post('/login', function(req, res) { // Request to Log User IN
    user.loginUser(req, res, con); // Calling function .loginUser() of Object User passing the input, output and database connection
});
app.post('/Signup', function(req, res) {// Request to Sign User Up
    user.newUser(req, res, con); // Calling function .newUser() of Object User passing the input, output and database connection
});
app.post('/borrow',function(req, res) {// Request to Borrow a Book
    borrow.borrowBooks(req,res,con); // Calling function .borrowBooks() of Object borrow passing the input, output and database connection
});

// Handling Requests of type GET, used to get Data from the server or databae
app.get('/verify', function(req, res) { // Request to verify email after signup, This request is from the browser after email link is clicked
    user.verify(req, res, con); // Calling function .verify() of Object User passing the input, output and database connection
});
app.get('/newbooks', function(req, res) { // Request to get a User's follower's New Books to be displayed on the timeline. This request is ajax call from front-end made after succesful login
    user.followerBooks(req.query.uuid, res, con); // Calling function .followerBooks() of Object User passing the uuid(unique user id), output and database connection
});
