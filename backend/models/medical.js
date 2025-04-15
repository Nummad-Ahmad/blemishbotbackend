const mongoose = require('mongoose');

const medicalSchema = new mongoose.Schema({
    sender: String,
    title: String,
    preventions: String,
    causes: String,
    remedies: String,
});


const medicalModel = mongoose.model("imedical", medicalSchema);


module.exports = medicalModel;