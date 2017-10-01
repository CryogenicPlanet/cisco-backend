//Imports
var sql = require('mysql');
var solr = require('solr-client');
var client = solr.createClient();
var express = require('express');
var app = express();
var exports = module.exports = {};

exports.getSearch = function(req, res, con) {

con.query("SELECT * FROM Books WHERE Name ='"+ req.body.name + "'", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
  });
}

