"use strict";
var User     				= require('../models/user');
var mongoose 				= require('mongoose');
var bcrypt 					= require('bcrypt-nodejs');
var authorisations  = require('../helpers/authorisations');

// app/routes.js
module.exports = function(app, passport) {

    // =====================================
    // ==== HOME PAGE (with login links) ===
    // =====================================
    // app.get('/', function(req, res) {
    //     res.render('index.ejs'); // load the index.ejs file
    // });

    // =====================================
    // ============= LOGIN =================
    // =====================================
    // show the login form
    app.get('/users/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('users/login.ejs', { message: req.flash('loginMessage') }); 
    });

    // process the login form
   app.post('/users/login', passport.authenticate('local-login', {
        successRedirect : '/', // redirect to the secure profile section
        failureRedirect : '/users/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // ==============SIGNUP ================
    // =====================================
    // show the signup form
    app.get('/users/register', authorisations.isLoggedIn, function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('users/new.ejs', {currentUser : req.user, message: req.flash('signupMessage') });
    });
		
		app.get('/users/edit/:id', authorisations.isLoggedIn, function(req, res) {
			User.findById({ _id: req.params.id }, function(err, user){
	    	if(err) throw err;

	    	res.render('users/edit.ejs', { currentUser : req.user, user: user, message: req.flash('signupMessage') });
	  	}); 
		});
		
    // process the signup form
    app.post('/users/register', authorisations.isLoggedIn, function(req, res) {
      var email = req.body.email;
      var firstName = req.body.firstName;
      var lastName = req.body.lastName;
      var admin = req.body.admin;
      var password = req.body.password;
      
      if(email === "" || firstName === "" || lastName === "") {
				message = "You forgot some fields! Try again.";
				res.render('users/new.ejs', {currentUser : req.user, message: message });
      }else{
				if(req.body.id){
					User.findByIdAndUpdate(req.body.id, {
						email : email,
						firstName : firstName,
						lastName : lastName,
						admin : admin,
					}, function(err, user){
						if(err) throw err;
							
						res.redirect("/users");
					});
				}else{
					if(admin === ""){
						admin = false;
					}
					var newUser = User();
						newUser.email = email;
						newUser.firstName = firstName;
						newUser.lastName = lastName;
						newUser.admin = admin;
						newUser.password = newUser.generateHash(password);

						console.log("test");

					newUser.save(function(err){
						if(err) throw err;
						console.log(res.req.body);
						res.location("users");
						res.redirect("/users");
					});
				}
			}
    });
		
		
		app.get('/users', authorisations.isLoggedIn, authorisations.isAdmin, function(req, res) {
			var gotError = "";
			if(typeof(req.query.error) !== "undefined"){
				if(req.query.error === "001")
					gotError = "You cannot delete the logged in account."
			}
			User.find({}, function(err, users) {
				if(err) throw err;
				
				res.render('users/index.ejs', {
					users: users,
					currentUser: req.user,
					message: gotError
				});
			});
		});
    // =====================================
    // ============= LOGOUT ================
    // =====================================
    app.get('/users/logout', function(req, res) {
        req.logout();
        res.redirect('/users/login');
    });
		
	app.get('/users/delete/:id', authorisations.isLoggedIn, function(req, res){
		if(req.params.id === req.user.id){
			res.redirect("/users/?error=001");
		}else{
			User.findByIdAndRemove(req.params.id, function(err){
				if(err) throw err;
				
				res.location("users");
				res.redirect("/users");
			});
		}
	});
	app.get("/users/refresh", authorisations.isLoggedIn, authorisations.isAdmin, function(req, res){
		User.find({}, function(err, users){
			if(err) throw err;
			
			users.forEach(function(user){
				user.holidaysLeft = "28";
				user.save(function(err){
					if(err) throw err;
				});
			});
			
			res.redirect("/users")
		});
	});
	// =====================================
    // =========== PASSWORD CHANGE =========
    // =====================================

    app.get("/users/password_change", authorisations.isLoggedIn, function(req, res){
    	res.render('users/password.ejs', { currentUser: req.user, message: ""}); 
    });

    app.post("/users/password_change", authorisations.isLoggedIn, function(req, res){
    	var userId = req.body.userId;
    	var oldPassword = req.body.old_password;
    	var newPassword = req.body.new_password;
    	var newPassword2 = req.body.new_password2;

			if(newPassword !== newPassword2){
				var message = "The passwords do not match";
    		res.render('users/password.ejs', { currentUser : req.user, message: message });
			}

    	User.findById(userId, function(err, user){
				if(err) throw err;
				bcrypt.compare(oldPassword, user.password, function(err, result) {
					if(!result){
						var message = "The old password is not correct";
    					res.render('users/password.ejs', { currentUser : req.user, message: message });
					}else{
    				user.password = user.generateHash(newPassword);
						user.save(function(err){
							if(err){
								res.status(err.status || 500);
						    res.render('error', {
						      message: err.message,
						      error: err
						    });
							}

							res.redirect("/flux/balance/");
						});
					}
				});
			});
    });
};




















