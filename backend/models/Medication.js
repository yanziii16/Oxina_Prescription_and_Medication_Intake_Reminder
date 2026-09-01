const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  timeOfDay: { type: String, required: true },
  refillCount: { type: Number, required: true, default: 0 },
  takenDate: { type: String, default: null }
});

module.exports = mongoose.model('Medication', medicationSchema);