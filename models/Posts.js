const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/keeknow');

const postSchema = mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    content: String,
    likes: [
        {type: mongoose.Schema.Types.ObjectId , ref:"user"}
    ]
});

module.exports = mongoose.model('Posts', postSchema);