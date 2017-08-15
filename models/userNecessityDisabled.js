var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userNecessityDisabledSchema = new Schema({
    userId: String,
    necessityId: String
});

module.exports = mongoose.model('UserNecessityDisabled', userNecessityDisabledSchema);