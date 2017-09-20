//Imports
var sql = require('mysql');
var exports = module.exports = {};
var solr = require('solr-client');
var client = solr.createClient();


exports.getSearch = function(req, res, con)

con.connect(function(err) {
  if (err) throw err;
  con.query("SELECT * FROM Books WHERE Name ='"+ req.body. + "'", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
  });
});