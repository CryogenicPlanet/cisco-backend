//Environment Variables
var port = process.env.PORT; // Port of server

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
var search = require("./search.js")
var books = require("./books.js")
var mail = require("./mail.js")
//Server Don't worry about this
var express = require('express'); // Framework for Node
var app = express(); // Establishing Express App
app.use(express.logger());
app.use(cors()); // Cors to Handle Url Authentication 
app.use(bodyParser.json()); // Using Body Parser
app.set('jwtTokenSecret', 'D2A8EC7BF22AECBEB745FDAAA892CDCD8A678D4E94C6452D58AD92C4D861A0C0839DEA1057CA539810FADF9806090D9EB6F610FE1AF6BC2A0DEA3D69455116AE'); // JWT Secret
var server = app.listen(port); // Set Port


//DataBase connection using promises
var con = null; 
mysql.createConnection({
    host: getenv('IP'),
    user: getenv('C9_USER'),
    password: "",
    database: "c9"
}).then(function(connection) { con = connection });

//Handling Requests of type POST, used to send Data to the server or database
app.post('/login', function(req, res) { // Request to Log User IN
    user.loginUser(req, res, con,app.get('jwtTokenSecret')); // Calling function .loginUser() of Object User passing the input, output and database connection
});
app.post('/Signup', function(req, res) {// Request to Sign User Up
    user.newUser(req, res, con); // Calling function .newUser() of Object User passing the input, output and database connection
});
app.post('/borrow',function(req, res) {// Request to Borrow a Book
    borrow.borrowBooks(req,res,con,app.get('jwtTokenSecret')); // Calling function .borrowBooks() of Object borrow passing the input, output and database connection
});
app.post('/addBook',function(req, res) {
    books.addBook(req,res,con,app.get('jwtTokenSecret'));
});

// Handling Requests of type GET, used to get Data from the server or databae
app.get('/verify', function(req, res) { // Request to verify email after signup, This request is from the browser after email link is clicked
    user.verify(req, res, con); // Calling function .verify() of Object User passing the input, output and database connection
});
app.get('/newbooks', function(req, res) { // Request to get a User's follower's New Books to be displayed on the timeline. This request is ajax call from front-end made after succesful login
    user.followerBooks(req, res, con,app.get('jwtTokenSecret')); // Calling function .followerBooks() of Object User passing the uuid(unique user id), output and database connection
});
app.get('/search',function(req, res) {
    search.getSearch(req,res,con);
});
app.get('/userDetails', function(req, res) {
    user.userDetails(req,res,con,app.get('jwtTokenSecret'));
});
app.get('/searchBooks', function(req, res) {
   search.getBooks(req,res,con); 
});
app.get('/searchAuthor',function(req, res) {
   search.getAuthor(req,res,con); 
});
app.get('/searchGenre', function(req, res) {
   search.getGenre(req,res,con); 
});
app.get('/showAuthor',function(req, res) {
    books.getAuthor(req,res,con);
});