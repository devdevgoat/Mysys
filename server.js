// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express();
var bodyParser = require('body-parser');
var multer = require('multer');
var session  = require('express-session');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var port     = process.env.PORT || 3000;

var passport = require('passport');
var flash    = require('connect-flash');

var http      =     require('http').Server(app);
var io        =     require("socket.io")(http);
// configuration ===============================================================
//file storage

// connect to our database
require('./config/passport')(passport); // pass passport for configuration

app.use('/src', express.static('src'));
//app.use(express.static(__dirname + '/src'));

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({
	secret: 'vidyapathaisalwaysrunning',
	resave: true,
	saveUninitialized: true
 } )); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session



// launch ======================================================================
//app.listen(port);
//console.log('The magic happens on port ' + port);




// routes ======================================================================
require('./app/routes.js')(app, passport,multer); // load our routes and pass in our app and fully configured passport
// mysys code ======================================================================
require('./mysys.js')(io);
// launch ======================================================================
http.listen(3000,function(){
    console.log("Listening on 3000");
});


