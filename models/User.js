const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/keeknow');

const userSchema = mongoose.Schema({
    name: String,
    username: String,
    email: String,
    password: String,
    posts:[{type: mongoose.Schema.Types.ObjectId, ref:"post"}],
})

module.exports = mongoose.model('User', userSchema);