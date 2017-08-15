var User = require("../models/user");
var HouseUser = require("../models/houseUser");

module.exports = {
  listOfUsers: function() {
    User.find({}, function(err, users){
      if(err) throw err;

      return users;
    });
  },
  getCurrentUserHouseId: function(currentUserId, next){
    HouseUser.findOne({"userId":currentUserId}, function(err, houseUser){
      return next(houseUser.houseId); //find out how to pass value to a variable on a called function next
    });
  }
}
