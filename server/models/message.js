const mongoose = require('./db');

var MessageSchema = new mongoose.Schema({
    user_name:{type:String, require: true},
    send_time: {type:String, require: true},
    msg_type: {type: Number, require: true},
    online_count: {type: Number},
    msg_content:{type: String}
});

module.exports = mongoose.model('Message',MessageSchema)