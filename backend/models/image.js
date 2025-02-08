const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    url: String,
    sender: String,
    date: String,
    title: String
});


const imageModel = mongoose.model("images", imageSchema);


module.exports = imageModel;