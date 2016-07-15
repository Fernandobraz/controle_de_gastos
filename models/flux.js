var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var fluxSchema = new Schema({
    userId: String,
    date: String,
    value: String,
    description: String,
    inOut: String,
    createdAt: String,
    type: String
});

module.exports = mongoose.model('Flux', fluxSchema);