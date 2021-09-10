//import express module 
var express = require('express');
//create an express app
var app = express();
//require express middleware body-parser
var bodyParser = require('body-parser');
//require express session
var session = require('express-session');
var cookieParser = require('cookie-parser');
var alert = require('alert');
//set the view engine to ejs
app.set('view engine', 'ejs');
//set the directory of views
app.set('views', './views');
//specify the path of static directory
app.use(express.static(__dirname + '/public'));

//use body parser to parse JSON and urlencoded request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//use cookie parser to parse request headers
app.use(cookieParser());
//use session to store user data between HTTP requests
app.use(session({
    secret: 'cmpe_273_secure_string',
    resave: false,
    saveUninitialized: true
}));

//Only user allowed is admin
var Users = [{
    "username": "admin",
    "password": "admin"
}];

//By Default we have 3 books
var books = [
    { "BookID": "1", "Title": "Book 1", "Author": "Author 1" },
    { "BookID": "2", "Title": "Book 2", "Author": "Author 2" },
    { "BookID": "3", "Title": "Book 3", "Author": "Author 3" }
]

//route to root
app.get('/', function (req, res) {
    //check if user session exits
    if (req.session.user) {
        res.render('/home');
    } else
        res.render('login');
});

app.post('/login', function (req, res) {
    if (req.session.user) {
        res.render('/home');
    } else {
        console.log("Req Body : ", req.body);
        Users.filter(user => {
            if (user.username === req.body.username && user.password === req.body.password) {
                req.session.user = user;
                res.redirect('home');
            } else {
                alert("Login credentials incorrect!");
                res.redirect('/');
            }
        });
    }
});

app.get('/home', function (req, res) {
    if (!req.session.user) {
        res.redirect('/');
    } else {
        console.log("Session data : ", req.session);
        res.render('home', {
            books: books
        });
    }
});

app.get('/create', function (req, res) {
    if (!req.session.user) {
        res.redirect('/');
    } else {
        res.render('create');
    }
});

app.post('/create', function (req, res) {
    if (!req.session.user) {
        res.render('/');
    } else {
        let isBookThere = books.filter(book => parseInt(book.BookID) == req.body.bookid);
        //Book already exists
        if(isBookThere.length == 1) {    
            alert("Book with ID already exists!");
            res.redirect('/home');
        }
        //Add book to object
        else {
            books.push({"BookID": req.body.bookid, "Title": req.body.title, "Author": req.body.author});
            res.redirect('/home');
        }
    }
});

app.get('/delete', function (req, res) {
    console.log("Session Data : ", req.session.user);
    if (!req.session.user) {
        res.redirect('/');
    } else {
        res.render('delete');
    }
});

app.post('/delete', function (req, res) {
    if (!req.session.user) {
        res.render('/');
    } else {
        let bodyLength = books.length
        books = books.filter(book => parseInt(book.BookID) != req.body.bookid);
        //Since book with particular ID did not get filtered (check is performed by checking length before and after filter function), it does not exist.
        if(books.length == bodyLength) {
            alert("Book does not exist!");
            res.redirect('/home');
        }
        //Book exists and is deleted from object
        else {
            res.redirect('/home');
        }
    }
});

app.get('/logout', function(req, res) {
    if (!req.session.user) {
        res.redirect('/');
    } else {
        req.session.user = "";
        res.redirect('/')
    }
});

var server = app.listen(3000, function () {
    console.log("Server listening on port 3000");
});