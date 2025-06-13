const mongoose = require('mongoose');

const logschema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    mobile: {
        type: Number,
        required: true  
    },
    password: {
        type: String,
        required: true,
    }
});

const collection = mongoose.model("registereduser", logschema);

module.exports = collection;
