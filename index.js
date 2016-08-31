'use strict';

var express = require('express');
var exphbr = require('express-handlebars');
var serveStatic = require('serve-static');
var bodyParser = require('body-parser');
var session = require('express-session');
var bcrypt = require('bcrypt');
var db = require("./common.js").db;
var config = require("./common.js").config;

var app = express();


app.engine('html', exphbr({
	defaultLayout: 'main',
	extname: '.html'
}));

app.set('view engine', 'html');

// Middleware to parse the data sent by the browser to the server.
app.use(bodyParser.urlencoded({
	extended: false
}));

app.use(session({
	secret: 'whatever',
	resave: false,
	saveUninitialized: true
}));

app.use(serveStatic(__dirname + '/public'));

app.get('/', function(req, res) {
	res.render('home');
});

// The route for the admin page.
app.get('/admin', function(req, res) {

	if (!req.session.logged_in) {
		res.redirect('/login');
	} else {
		// we need to send the admin page contents here
		res.send('<p>You are logged in.</p><br><a href="/logout">Logout</a>');
	}
});


// The route for the login page.
app.get('/login', function(req, res) {
	res.render('login');
});

// The route for the login form submission.
app.post('/login', function(req, res) {

	var allowed = false;

	// Checks against the DB if the username exists
	db.select()
		.where('username', req.body.username)
		.from(config.tables.users)
		.limit(1)
		.then(function(results) {

			if (results.length) {
				// The username exists. Compares the provided password with the stored hash
				bcrypt.compare(req.body.password, results[0].password, function(err, result) {
					if (err) {
						console.log(err);
					} else {
						// If the hash and pass doesn't match:
						if (!result) {
							return res.redirect('/login?error=wrong_login');
						}

						// If the hash and pass matches
						req.session.logged_in = true;
						allowed = true; // do we still need this?
						res.redirect('/admin');
					}

				});

			} else {
				// In case the username doesn't exist in the DB
				return res.redirect('/login?error=wrong_login');
			}
		}).catch(console.log);
});

// The route for logging out.
app.get('/logout', function(req, res) {

	// Should always regenerate a session when changing authenticated state of a session (login/logout).
	req.session.regenerate(function(error) {
		res.redirect('/login');
	});
});



app.listen(3000, function() {
	console.log('Example app listening on port 3000!');
});

// This catches errors from middleware and routes.
// We don't want to send full error stack traces to the client (browser).
app.use(function(err, req, res, next) {
	console.error(err.stack);
	res.status(500).send('Something broke!');
});