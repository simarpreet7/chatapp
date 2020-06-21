var mongoose = require("mongoose");


var friendSchema = new mongoose.Schema({
 user_name:String,
 friends:Array,
});


module.exports = mongoose.model("friend",friendSchema);

