"use strict";
var express = require('express');
var router = express.Router();
var moment = require('moment');
var today = moment();
var authorisations  = require('../helpers/authorisations');

/* GET home page. */
router.get('/', authorisations.isLoggedIn, function(req, res, next) {
	res.render('index', { title: 'Express', currentUser : req.user });
  
});

module.exports = router;
