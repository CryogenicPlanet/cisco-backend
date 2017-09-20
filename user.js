//Libraries
var mysql = require('mysql');
var sha512 = require('sha512');
var randomstring = require("randomstring");

var exports = module.exports = {};

exports.newUser = function(req, res, con) {
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.pword;
    var key = randomstring.generate(8);
    var hasher = sha512.hmac(key);
    var hash = hasher.finalize(password) // Password here;
    var finalPassword = hash.toString('hex');
    console.log(hash.toString('hex'));
        var sql = "INSERT INTO Users (Name, Email,Password,Salt) VALUES ('"+name+"','"+email +"','"+finalPassword+"','"+ key +"')";
        console.log(sql);
        con.query(sql, function(err, result) {
            if (err) throw err;
            console.log("1 record inserted");
        });
}
