//Imports
const fs = require('fs');
const Fuse = require("fuse.js");
var exports = module.exports = {};

exports.getSearch = function(req, res, con) {
    var options = {
  shouldSort: true,
  threshold: 0.6,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: [
    "name",
    "author"
]
};
console.log("pre");
var book = JSON.parse(fs.readFileSync('books.json', 'utf8'));
var fuse = new Fuse(book, options); // "list" is the item array
var result = fuse.search("of");
console.log(result);
}

