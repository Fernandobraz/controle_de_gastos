var configValues = require('./config');
// var mongoose = require('mongoose');
// console.log("Connection to DB...");
// var db = mongoose.connect('mongodb://localhost/holiday-booking');
// module.exports = db;

module.exports = {
    getDbConnectionString: function(){
    	console.log("Connecting to Databse...");
    	console.log("Database Connected!");
        return 'mongodb://' + configValues.uname + ':' + configValues.pwd + '@ds017248.mlab.com:17248/gastos_mensais';
    }
}