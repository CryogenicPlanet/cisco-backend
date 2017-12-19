const jwt = require('jsonwebtoken'); // Json Web Token Library; Used for authentication
const fs = require('fs');
var exports = module.exports = {};

exports.addBook = async function(req, res, con, secret) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    var uuid;
    jwt.verify(token, secret, function(err, decoded) {
        if (err) {
            return res.json({ success: false, message: 'Failed to authenticate token.' });
        }
        else {
            // Everything is good
            uuid = decoded.uuid;
        }
    }); // Get's User Id From JWT Token
    var book = {};
    console.log(req.body);
    if (req.body.image) {
        book.image = req.body.image;
    }
    else {
        book.image = "/Images/books.jpeg";
    }
    if (req.body.ubid) { // If Book Already Exists and User Chooses This
        addUserbook(con, uuid, req.body.ubid, req.body.description, book.image);
        var message = {
            message: "Sucessfully Added"
        };
        res.status(200).json(message); // Exits Code Here
    }
    else {
        // By This Point We know book doesn't already Exsist


        if (req.body.uaid) { // Author Already Exsists
            book.uaid = req.body.uaid;
            let [author] = await con.query(`SELECT Name FROM Authors WHERE UAID=${book.uaid}`);
            book.author = author.Name;
        }
        else {
            book.author = req.body.author;
            let addAuthor = await con.query(`INSERT INTO Authors (Name) VALUES ("${book.author}")`);
            let [author] = await con.query(`SELECT UAID FROM Authors WHERE Name="${book.author}"`);
            book.uaid = author.UAID;
        }
        if (req.body.ugid) { // Genre Already Exsists
            book.ugid = req.body.ugid;
            let [genre] = await con.query(`SELECT Name FROM Genres WHERE UGID=${book.ugid}`);
            book.genre = genre.Name
        }
        else {
            book.genre = req.body.genre;
            let addGenres = await con.query(`INSERT INTO Genres (Name) VALUES ("${book.genre}")`);
            let [genre] = await con.query(`SELECT UGID FROM Genres WHERE Name="${book.genre}"`);
            book.ugid = genre.UGID;
        }
        // By This Point Books Author and Genre are Confirmed
        book.name = req.body.name;
        book.year = req.body.year;
        book.description = req.body.description;
        if (addNewBookDb(con, book.name, book.uaid, book.ugid, book.year)) {
            let [addedbook] = await con.query(`SELECT UBID FROM Books WHERE Name="${book.name}"`);
            book.ubid = addedbook.UBID;

            addUserbook(con, uuid, book.ubid, book.description, book.image);
            if (addNewBookFile(book.ubid, book.name, book.author, book.genre, book.year)) {
                var message = {
                    message: "Sucessfully Added"
                };
                res.status(200).json(message);
            }
        }

    }
}
var addUserbook = async function(con, uuid, ubid, description, image) {
    let [addUserBooks] = await con.query(`INSERT INTO ${"`User's Book`"} (User,Book,Description,Image) VALUES (${uuid},${ubid},"${description}","${image}")`);
}
var addNewBookDb = async function(con, name, uaid, ugid, year) {
    try {
        let [addBookDB] = await con.query(`INSERT INTO Books (Name,Author,Genre,Year) VALUES ("${name}",${uaid},${ugid},${year})`);
        return true;
    }
    catch (err) {
        return false;
    }

}
var addNewBookFile = async function(ubid, name, author, genre, year) {
    var books = JSON.parse(fs.readFileSync('books.json', 'utf8'));
    var newBook = {
        ubid: ubid,
        title: name,
        author: author,
        genre: genre,
        year: year
    };
    books.push(newBook);
    if (fs.writeFile("books.json", JSON.stringify(books), function(err) {
            if (err) throw err;
            return true;
        })) {
        return true;
    }

}
exports.getAuthor = async function(req, res, con) {
    var books = [];

    function NewBook(ubid, bookname, author, genre, year, description, image) {
        this.ubid = ubid;
        this.bookname = bookname;
        this.author = author;
        this.genre = genre;
        this.year = year;
        //   this.image = image
    }
    console.log("Uaid : " + req.query.uaid);
    var getBooks = await con.query(`SELECT * FROM Books WHERE Author=${req.query.uaid}`);
    for (var book of getBooks) {
        let [genre] = await con.query(`SELECT * FROM Genres WHERE UGID=${book.Genre}`);
        let [author] = await con.query(`SELECT * FROM Authors WHERE UAID=${req.query.uaid}`) 
        books.push(new NewBook(book.UBID, book.Name, author, genre, book.Year));
    }
    res.status(200).json({
        books: books
    });

}
