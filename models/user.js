
// User Model

var mongoose = require('mongoose'),
   Schema = mongoose.Schema,
   ObjectId = Schema.ObjectId;

var userSchema = new Schema({
    state: {
        type: 'String',
        required: true,
        enum: ['active', 'temporary', 'inactive'],
        lowercase: true
    },
    name: String,
    lastName: String,
    username: String,
    email: String,
    score: { type: Number, min: 0, max: 10000, required: true },
    created: Date,
    notificacions: [ String ]
}, {
    collection: 'users'
});

module.exports = mongoose.model('User', userSchema);
