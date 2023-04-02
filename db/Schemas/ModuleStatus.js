const { Schema, model } = require('mongoose');

module.exports = model('ModuleStatus', new Schema({
    group: {
        type: Number,
        unique: true
    },
    details: [{
        module: String,
        status: Number
    }]
}));