const mongoose = require('mongoose');

const SuvicharSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        default: 'मंजिलें क्या हैं, रास्ता क्या है? हौसला हो तो फासला क्या है?'
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Suvichar', SuvicharSchema);
