const mongoose = require('mongoose');
const labSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: String,
  equipment: String,
  features: [String],
  seatsAvailable: Number
});

module.exports = mongoose.model('Lab', labSchema);
