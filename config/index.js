var configValues = require('./config');
// var mongoose = require('mongoose');
// console.log("Connection to DB...");
// var db = mongoose.connect('mongodb://localhost/holiday-booking');
// module.exports = db;

module.exports = {
    getDbConnectionString: function(){
    	console.log("Connecting to Databse...");
    	console.log("Database Connected!");
        return 'mongodb://' + configValues.uname + ':' + configValues.pwd + '@ds119748.mlab.com:19748/gastosmensais';
    }
}