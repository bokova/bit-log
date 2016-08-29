'use strict';

var express = require('express');
var exphbr = require('express-handlebars');
var serveStatic = require('serve-static');
var bodyParser = require('body-parser');
var session = require('express-session');
var knex = require('knex');
var mysql = require('mysql');
var db = require("./db.js").db;

var app = express();




app.engine('html', exphbr({
	defaultLayout: 'main',
	extname: '.html'
}));

app.set('view engine', 'html');

// Middleware to parse the data sent by the browser to the server.
app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
	secret: 'whatever', 
	resave: false,
	saveUninitialized: true
}));

// BTW: how would you actually store the secret in a real-world scenario, if the source code is on github?
// in a standalone js file that's not shared, or?

app.use(serveStatic(__dirname + '/public'));

app.get('/', function (req, res) {
	res.render('home');
});

// The route for the admin page.
app.get('/admin', function (req, res) {

	if (!req.session.logged_in) {
		res.redirect('/login');
	} else {
		// we need to send the admin page contents here
		res.send('<p>You are logged in.</p><br><a href="/logout">Logout</a>');
	}
});


// The route for the login page.
app.get('/login', function (req, res) {
	res.render('login');
});


// this needs to go and get replaced by a DB connection
var logins = [
	{
		username: 'test',
		password: 'test'
	},
	{
		username: 'test2',
		password: 'test2'
	}
];


// The route for the login form submission.
app.post('/login', function (req, res) {

	var allowed = false;

	// Check against the DB

	// check if user exists

	// if so, fetch his pass hash

	// compare password with hash
	bcrypt.compareHashSync(userPassword, hash,  function(err, res) {
		if (!res) {
			return res.redirect('/login?error=wrong_login');

		}

		// if res === true
		req.session.logged_in = true;
		res.redirect('/admin');

	});

 // -> Returns true if they match, false otherwise.

	// Normally, this would be done by checking the user information which is stored in a database.
	// For simplicity, we did things this way (the wrong way).
	logins.forEach(function(login) {
		if (
			login.username === req.body.username &&
			login.password === req.body.password
		) {
			allowed = true;
		}
	});

	if (!allowed) {
		return res.redirect('/login?error=wrong_login');
	}

	// They are allowed.

	// We set a session variable here, so that we know the session is authenticated.
	req.session.logged_in = true;
	res.redirect('/admin');
});

// The route for logging out.
app.get('/logout', function(req, res) {

	// Should always regenerate a session when changing authenticated state of a session (login/logout).
	req.session.regenerate(function(error) {
		res.redirect('/login');
	});
});




app.listen(3000, function () {
	console.log('Example app listening on port 3000!');
});

// This catches errors from middleware and routes.
// We don't want to send full error stack traces to the client (browser).
app.use(function(err, req, res, next) {
	console.error(err.stack);
	res.status(500).send('Something broke!');
});