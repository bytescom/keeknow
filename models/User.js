const mongoose = require('mongoose');
const Posts = require('./Post');

const userSchema = mongoose.Schema({
    name: String,
    username: String,
    email: String,
    password: String,
    posts:[{type: mongoose.Schema.Types.ObjectId, ref:"Post"}],
})

module.exports = mongoose.model('User', userSchema);