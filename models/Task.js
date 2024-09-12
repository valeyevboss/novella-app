const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    name: String,
    rewardTokens: Number,
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' }
});

module.exports = mongoose.model('Task', TaskSchema);