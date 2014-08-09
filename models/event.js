// Model Event

var mongoose = require('mongoose'),
   Schema = mongoose.Schema,
   ObjectId = Schema.ObjectId;

var eventSchema = new Schema({
    type: {
        type: String,
        required: true,
        enum: ['debug', 'warning', 'error'],
        lowercase: true
    },
    text: String,
    date: Date
}, {
    collection: 'events'
});

module.exports = mongoose.model('Event', eventSchema);
