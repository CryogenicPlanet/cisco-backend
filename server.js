//Environment Variables
var port = process.env.PORT;

//Libraries
var getenv = require('getenv');
var mysql = require('mysql');
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
var con = mysql.createConnection({
    host: getenv('IP'),
    user: getenv('C9_USER'),
    password: "",
    database: "c9"
});
con.connect(function(err) {

    if (err) console.log("Error :" + err);
    else console.log("Successful Db Con");
});
// HTTP Requests
app.post('/login', function(req, res) {
  user.loginUser(req,res,con);
});
app.post('/Signup',function(req, res){
    user.newUser(req,res,con);
});

