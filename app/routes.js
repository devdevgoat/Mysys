// app/routes.js
module.exports = function(app, passport,multer) {

	// =====================================
	// HOME PAGE (with login links) ========
	// =====================================
	app.get('/', function(req, res) {
		//res.render('index.ejs'); // load the index.ejs file
		res.redirect('/login');
	});

	// =====================================
	// LOGIN ===============================
	// =====================================
	// show the login form
	app.get('/login', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('login.ejs', { message: req.flash('loginMessage') });
	});

	// process the login form
	app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/player_selection', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
		}),
        function(req, res) {
            console.log("hello");

            if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
            }
        res.redirect('/');
    });

	// =====================================
	// SIGNUP ==============================
	// =====================================
	// show the signup form
	app.get('/signup', function(req, res) {
		// render the page and pass in any flash data if it exists
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});

	app.get('/test', function(req, res) {
		// render the page and pass in any flash data if it exists
		res.render('test.ejs');
	});

	// process the signup form
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/player_selection', // redirect to the secure profile section
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	// =====================================
	// Player SECTION =========================
	// =====================================
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	app.get('/player/:playerId/:playerName', isLoggedIn, function(req, res) {
		res.render('profile.ejs', {
			user : req.user, // get the user out of session and pass to template
			playerName: req.params['playerName'],
			playerId: req.params['playerId']
		});
	});

	// =====================================
	// Player Choice SECTION =========================
	// =====================================
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	app.get('/player_selection', isLoggedIn, function(req, res) {
		res.render('player_selection.ejs', {
			user : req.user // get the user out of session and pass to template
		});
	});

	// =====================================
	// GM COCKPIT =========================
	// =====================================
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	app.get('/IMTHEGM', isLoggedIn, function(req, res) {
		res.render('gm_cockpit.ejs', {
			user : req.user // get the user out of session and pass to template
		});
	});

	
	// =====================================
	// file up ==============================
	// =====================================


	app.get('/create_player',isLoggedIn, function(req,res){
		
		var details = {
        	stat: 'false',
        	userId: req.user.id,
			playerName: 'tmp',
			PE : 0,
			ME : 0,
			SE : 0,
			IMG : 0,
			INFO : 'tmp'
			};
    	res.render('create_player.ejs', {
			user : req.user ,// get the user out of session and pass to template
			data : details
		});
	});

	var multipartUpload = multer({storage: multer.diskStorage({
	    destination: function (req, file, callback) { 
	    	callback(null, './src/img/player_imgs/');
	    },
	    filename: function (req, file, callback) { 
	    	callback(null, req.user.id + '-' + Date.now()  + '-' + file.originalname);
	    }})
		}).single('avatar');

	app.post('/create_player',isLoggedIn,multipartUpload, function(req,res){
		var fileName = req.user.id + '-' + req.body.playerName + '-' + req.file.originalname;
		var details = {
        	stat: 'true',
        	userId: req.user.id,
			playerName: req.body.playerName,
			PE : req.body.peStat,
			ME : req.body.meStat,
			SE : req.body.seStat,
			IMG : req.file.filename,
			INFO : req.body.info
			};
		res.render('create_player.ejs', {
			user : req.user ,// get the user out of session and pass to template
			data : details
		});



	});

	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});


	
};

// route middleware to make sure
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}
