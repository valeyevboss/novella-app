	const mongoose = require('mongoose');

	const bannedIPSchema = new mongoose.Schema({
		ip: { type: String, unique: true, required: true },
		reason: String,
		banDate: { type: Date, default: Date.now }
	});

	const BannedIP = mongoose.model('BannedIP', bannedIPSchema);

	module.exports = BannedIP;
