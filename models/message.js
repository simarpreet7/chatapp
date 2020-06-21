var mongoose = require("mongoose");


var messageSchema = new mongoose.Schema({
    text: String,
    s_by: String,//send by
    cdate: { type: Date, default: Date.now },
    r_by:String

});



module.exports = mongoose.model("message",messageSchema);

