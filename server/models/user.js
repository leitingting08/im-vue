const mongoose = require('./db');

var UserSchema = new mongoose.Schema({
    user_name:{type:String, require: true}
});

module.exports = mongoose.model('User',UserSchema);