var configValues = require('./config');
// var mongoose = require('mongoose');
// console.log("Connection to DB...");
// var db = mongoose.connect('mongodb://localhost/holiday-booking');
// module.exports = db;

module.exports = {
    getDbConnectionString: function(){
    	console.log("Connecting to Online Databse...");
    	console.log("Online Database Connected!");
        return 'mongodb://' + configValues.uname + ':' + configValues.pwd + '@ds119748.mlab.com:19748/gastosmensais';
    },
    getDbConnectionStringOffline: function(){
      console.log("Connecting to Offline Databse...");
      console.log("Offline Database Connected!");
        return 'localhost:27017/gastosmensais';
    }
}