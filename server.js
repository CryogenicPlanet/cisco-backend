//Environment Variables
var port = process.env.PORT;

//Libraries
var getenv = require('getenv');
var mysql = require('promise-mysql');
var sha512 = require('sha512');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var cors = require("cors");
//Modules
var user = require("./user.js");
//Server
var express = require('express');
var app = express();
app.use(express.logger());
app.use(cors());
app.use(bodyParser.json());
var server = app.listen(port);

//Db connection

var con = null;
mysql.createConnection({
    host: getenv('IP'),
    user: getenv('C9_USER'),
    password: "",
    database: "c9"
}).then(function(connection) {con = connection});
// con.connect(function(err) {

//     if (err) console.log("Error :" + err);
//     else console.log("Successful Db Con");
// });
// HTTP Requests
app.post('/login', function(req, res) {
  user.loginUser(req,res,con);
});
app.post('/Signup',function(req, res){
    user.newUser(req,res,con);
});
app.get('/verify',function(req, res) {
    user.verify(req,res,con);
});
app.get('/newbooks',function(req, res) {
    user.followerBooks(req.query.uuid,res,con);
});

