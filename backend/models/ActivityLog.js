const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Admin',
        required: true 
    },
    username: {
        type: String,
        required: true
    },
    action: { 
        type: String, 
        required: true 
    },
    details: { 
        type: String, 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
