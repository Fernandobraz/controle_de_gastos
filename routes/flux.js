"use strict";
var express = require('express');
var router = express.Router();
var moment = require('moment');
var today = moment();
var authorisations  = require('../helpers/authorisations');
var Flux = require("../models/flux");
var User = require("../models/user");

/* GET home page. */
router.get('/', authorisations.isLoggedIn, function(req, res, next) {
  var monthList = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december", ]

    Flux.find({"userId": req.user._id}, function(err, fluxes){
      if(err){
        res.status(err.status || 500);
        res.render("error.ejs", {message: err.message, error: err});
      }

      res.render('flux/index.ejs', { currentUser: req.user, fluxes: fluxes, monthList: monthList, moment: moment});
    }).sort({"_id": -1}).limit(10);
});

router.get('/new', authorisations.isLoggedIn, function(req, res, next){
	res.render('flux/new.ejs', {currentUser : req.user, today: today, message: ""});
});

router.post('/create', authorisations.isLoggedIn, function(req, res){
	var currentUser = req.user;
  var userId = req.body.userId;
  var date = req.body.date;
  var value = req.body.value;
  var description = req.body.description;
  var inOut = req.body.inOut;
  var type = req.body.type;
  
  if(date === "" || value === "" || description === "") {
    var message = "You forgot some fields! Try again.";
    res.render('flux/new.ejs', { today: today, currentUser : req.user, message: message});
  }else{
    var newFlux = Flux();
      newFlux.userId = userId;
      newFlux.date = date;
      newFlux.value = value;
      newFlux.description = description;
      newFlux.inOut = inOut;
      newFlux.type = type;
      newFlux.createdAt = today.format('YYYY-MM-DD');
    newFlux.save(function(err){
      
      if(err) throw err;
      res.redirect("/flux/");
    });
  }
});
router.get('/edit/:id', authorisations.isLoggedIn, function(req, res, next){
  Flux.findOne({"_id": req.params.id}, function(err, flux){
    if(err){
      res.status(err.status || 500);
      res.render("error.ejs", {message: err.message, error: err});
    }

    res.render('flux/edit.ejs', {currentUser : req.user, today: today, message: "", flux: flux});
  });
});

router.post("/update", authorisations.isLoggedIn, function(req,res){
  var id = req.body.id
  var date = req.body.date;
  var value = req.body.value;
  var description = req.body.description;
  var inOut = req.body.inOut;
  var type = req.body.type;
  Flux.findByIdAndUpdate(id, {
    date: date,
    value: value,
    description: description,
    inOut: inOut,
    type: type
  }, function(err, flux){
    if(err) throw err;

    res.redirect("/flux");
  });
});

router.get('/delete/:id', authorisations.isLoggedIn, function(req, res){
    Flux.findById(req.params.id, function(err, flux){
      if(err){
        res.status(err.status || 500);
        res.render('error', {
          message: err.message,
          error: err
        });
      }

      flux.remove({}, function(err){
        if (err) {
            res.statusCode = 500;
            res.send(err);
        } else {
          res.redirect("/flux/");
        }
      });
    });
  });

router.get("/monthly/:month", authorisations.isLoggedIn, function(req, res){
  var month = req.params.month;
  var relevantData = [];
  Flux.find({"userId": req.user._id}, function(err, fluxes){
    if(err){
      res.status(err.status || 500);
      res.render("error.ejs", {message: err.message, error: err});
    }

    fluxes.forEach(function(flux){
      if(moment(flux.date).format("MMMM").toLowerCase() === month){
        relevantData.push(flux);
      }
    });

    res.render('flux/monthly.ejs', { currentUser: req.user, fluxes: relevantData, month: month, moment: moment});
  });
});

router.get("/balance", authorisations.isLoggedIn, function(req, res){
  Flux.find({"userId": req.user._id}, function(err, fluxes){
    if(err){
      res.status(err.status || 500);
      res.render("error.ejs", {message: err.message, error: err});
    }
    var totalIn = 0, totalOut = 0;
    fluxes.forEach(function(flux){
      if(flux.inOut === "in"){
        totalIn += parseFloat(flux.value);
      }else{
        totalOut += parseFloat(flux.value);
      }
    });

    res.render('flux/balance.ejs', { 
      currentUser: req.user, 
      fluxes: fluxes, 
      totalOut: totalOut, 
      totalIn: totalIn, 
      today: today,
      moment: moment
    });
  });
});

module.exports = router;




















