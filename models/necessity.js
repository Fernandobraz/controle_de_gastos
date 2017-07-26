var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var necessitySchema = new Schema({
    name: String,
    approxPrice: String,
    needed: Boolean,
    typeId: String
});

module.exports = mongoose.model('Necessity', necessitySchema);