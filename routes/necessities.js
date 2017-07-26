"use strict";
var express = require('express');
var router = express.Router();
var authorisations  = require('../helpers/authorisations');
var Necessity = require("../models/necessity");
var NecessitiesType = require("../models/necessitiesType");


/* GET home page. */
router.get('/', authorisations.isLoggedIn, function(req, res, next) {
  Necessity.find({}, function(err, necessities){
    if(err){
      res.status(err.status || 500);
      res.render("error.ejs", {message: err.message, error: err});
    }
    res.render('necessities/index.ejs', { currentUser: req.user, necessities: necessities});
  });
});

router.get('/new', authorisations.isLoggedIn, function(req, res, next){
  NecessitiesType.find({}, function(err, necessitiesTypes){
    res.render('necessities/new.ejs', {currentUser : req.user, message: "", necessitiesTypes: necessitiesTypes});
  });
});

router.post('/create', authorisations.isLoggedIn, function(req, res){
  var name = req.body.name;
  var approxPrice = req.body.approxPrice;
  var typeId = req.body.typeId;
  
  if(typeId === "none" || name === "" || approxPrice === "") {
    var message = "You forgot some fields! Try again.";
    res.render('necessities/new.ejs', { currentUser : req.user, message: message, necessitiesTypes: necessitiesTypes});
  }else{
    var newNecessity = Necessity();
      newNecessity.name = name;
      newNecessity.approxPrice = approxPrice;
      newNecessity.typeId = typeId;
      newNecessity.needed = false;
    newNecessity.save(function(err){
      
      if(err) throw err;
      res.redirect("/necessities/");
    });
  }
});
router.get('/edit/:id', authorisations.isLoggedIn, function(req, res, next){
  Necessity.findOne({"_id": req.params.id}, function(err, necessity){
    if(err){
      res.status(err.status || 500);
      res.render("error.ejs", {message: err.message, error: err});
    }
    NecessitiesType.find({}, function(err, necessitiesTypes){
      res.render('necessities/edit.ejs', {currentUser : req.user, message: "", necessity: necessity, necessitiesTypes: necessitiesTypes});
    });
  });
});

router.post("/update", authorisations.isLoggedIn, function(req,res){
  var name = req.body.name
  var approxPrice = req.body.approxPrice;
  var typeId = req.body.typeId;
  Necessity.findByIdAndUpdate(id, {
    name: name,
    approxPrice: approxPrice,
    typeId: typeId,
  }, function(err, necessity){
    if(err) throw err;

    res.redirect("/necessities/");
  });
});

router.get('/delete/:id', authorisations.isLoggedIn, function(req, res){
  Necessity.findById(req.params.id, function(err, necessity){
    if(err){
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: err
      });
    }

    necessity.remove({}, function(err){
      if (err) {
          res.statusCode = 500;
          res.send(err);
      } else {
        res.redirect("/necessities/");
      }
    });
  });
});

router.get('/manager', authorisations.isLoggedIn, function(req, res){
  Necessity.find({"needed": false}, function(err, necessities){
    if(err){
      res.status(err.status || 500);
      res.render("error.ejs", {message: err.message, error: err});
    }
    res.render('necessities/groceriesManager.ejs', { currentUser: req.user, necessities: necessities});
  });
});

router.post('/managerUpdate', authorisations.isLoggedIn, function(req, res){

  Necessity.update({"_id": { $in: req.body.necessity }}, {$set: { needed: true }}, {multi: true}, function(err, updated){
    res.redirect("/necessities/list");
  });
});

router.get('/list', authorisations.isLoggedIn, function(req, res){
  Necessity.find({"needed": true}, function(err, necessities){
    if(err){
      res.status(err.status || 500);
      res.render("error.ejs", {message: err.message, error: err});
    }
    res.render('necessities/groceries.ejs', { currentUser: req.user, necessities: necessities});
  });
});

router.post('/listUpdate', authorisations.isLoggedIn, function(req, res){

  Necessity.update({"_id": { $in: req.body.necessity }}, {$set: { needed: false }}, {multi: true}, function(err, updated){
    res.redirect("/necessities/list");
  });
});


module.exports = router;




















