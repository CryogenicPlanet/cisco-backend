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
    "title",
    "author"
]
};
var book = JSON.parse(fs.readFileSync('books.json', 'utf8'));
//console.log(book);
var fuse = new Fuse(book, options); // "list" is the item array
var result = fuse.search("of the");
console.log(result);
}

