"use strict";
var express = require('express');
var router = express.Router();
var moment = require("moment");
var authorisations  = require('../helpers/authorisations');
var Necessity = require("../models/necessity");
var NecessitiesType = require("../models/necessitiesType");
var Flux = require("../models/flux");
var today = moment();
var UserNecessityDisabled = require("../models/userNecessityDisabled");
var commonFunctions = require("../helpers/commonFunctions");


/* GET home page. */
router.get('/', authorisations.isLoggedIn, function(req, res, next) {  
  UserNecessityDisabled.find({}, function(err, necessityDisabled){
    var disabledList = new Array();
    if(err) throw err;
    for(var i = 0; i < necessityDisabled.length; i++){
      disabledList[i] = necessityDisabled[i].necessityId.toString();
    }

    Necessity.find({"_id": {$nin: disabledList}}, function(err, necessities){
      if(err){
        res.status(err.status || 500);
        res.render("error.ejs", {message: err.message, error: err});
      }
      res.render('necessities/index.ejs', { currentUser: req.user, necessities: necessities});
    });
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
  var deletedIndex;

  if(typeId === "none" || name === "" || approxPrice === "") {
    var message = "You forgot some fields! Try again.";
    res.render('necessities/new.ejs', { currentUser : req.user, message: message, necessitiesTypes: necessitiesTypes});
  }else{
    UserNecessityDisabled.find({"userId": req.user.id}, function(err, necessityDisabled){
      var disabledList = new Array();
      if(err) throw err;
      for(var i = 0; i < necessityDisabled.length; i++){
        disabledList[i] = necessityDisabled[i].necessityId.toString();
      }
    
      Necessity.find({"name": name }, function(err, necessities){
        if(necessities.length > 0){
          var necessityIsDisabled = false;
          for(var i = 0; i< disabledList.length; i++){
            if(disabledList[i] === necessities[0]._id.toString()){
              necessityIsDisabled = true;
              deletedIndex = i;
            }
          }

          if(necessityIsDisabled){
            necessityDisabled[deletedIndex].remove({}, function(err){
              if(err){
                res.statusCode = 500;
                res.send(err);
              }else{
                res.redirect("/necessities/");
              }
            });
          }else{
            NecessitiesType.find({}, function(err, necessitiesTypes){
              var message = "This necessity already exists";
              res.render('necessities/new.ejs', {currentUser : req.user, message: message, necessitiesTypes: necessitiesTypes});
            });
          }
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
  var id = req.body.id;
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

    var disabledNecessity = UserNecessityDisabled();

    disabledNecessity.userId = req.user.id;
    disabledNecessity.necessityId = necessity.id;

    disabledNecessity.save(function(err){
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
    var newFlux = Flux();
    newFlux.userId = req.user.id;
    newFlux.date = today.format('DD-MM-YYYY');
    newFlux.time = today.format('H:mm');
    newFlux.value = req.body.totalValue[0];
    newFlux.description = "Groceries";
    newFlux.inOut = "out";
    newFlux.type = "once";
    newFlux.createdAt = today.format('YYYY-MM-DD');
    
    newFlux.save(function(err){
      if(err) throw err;
      res.redirect("/necessities/list");
    });
  });
});


module.exports = router;




















