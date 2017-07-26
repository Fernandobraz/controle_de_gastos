"use strict";
var express = require('express');
var router = express.Router();
var authorisations  = require('../helpers/authorisations');
var NecessitiesType = require("../models/necessitiesType");


/* GET home page. */
router.get('/', authorisations.isLoggedIn, authorisations.isAdmin, function(req, res, next) {
  NecessitiesType.find({}, function(err, necessitiesTypes){
    if(err){
      res.status(err.status || 500);
      res.render("error.ejs", {message: err.message, error: err});
    }

    res.render('necessitiesTypes/index.ejs', { currentUser: req.user, necessitiesTypes: necessitiesTypes});
  });
});

router.get('/new', authorisations.isLoggedIn, authorisations.isAdmin, function(req, res, next){
  res.render('necessitiesTypes/new.ejs', {currentUser : req.user, message: ""});
});

router.post('/create', authorisations.isLoggedIn, authorisations.isAdmin, function(req, res){
  var name = req.body.name;
  
  if(name === "") {
    var message = "You forgot some fields! Try again.";
    res.render('necessitiesTypes/new.ejs', { currentUser : req.user, message: message});
  }else{
    var newNecessitiesType = NecessitiesType();
      newNecessitiesType.name = name;
    newNecessitiesType.save(function(err){
      
      if(err) throw err;
      res.redirect("/necessitiesTypes/");
    });
  }
});

router.get('/edit/:id', authorisations.isLoggedIn, authorisations.isAdmin, function(req, res, next){
  NecessitiesType.findOne({"_id": req.params.id}, function(err, necessitiesType){
    if(err){
      res.status(err.status || 500);
      res.render("error.ejs", {message: err.message, error: err});
    }

    res.render('necessitiesTypes/edit.ejs', {currentUser : req.user, message: "", necessitiesType: necessitiesType});
  });
});

router.post("/update", authorisations.isLoggedIn, authorisations.isAdmin, function(req,res){
  var name = req.body.name;
  var id = req.body.id;
  // todo validation
  console.log(name);
  NecessitiesType.findByIdAndUpdate(id, {
    name: name
  }, function(err, necessitiesType){
    if(err) throw err;

    res.redirect("/necessitiesTypes/");
  });
});

router.get('/delete/:id', authorisations.isLoggedIn, authorisations.isAdmin, function(req, res){
  NecessitiesType.findById(req.params.id, function(err, necessitiesType){
    if(err){
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: err
      });
    }

    necessitiesType.remove({}, function(err){
      if (err) {
          res.statusCode = 500;
          res.send(err);
      } else {
        res.redirect("/necessitiesTypes/");
      }
    });
  });
});

module.exports = router;












