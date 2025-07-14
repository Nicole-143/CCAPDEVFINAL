const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lab: { type: mongoose.Schema.Types.ObjectId, ref: 'Lab', required: true },
  seatNumber: Number,
  date: { type: Date, required: true },
   startTime: { type: String, required: true }, // e.g., "09:00"
  endTime: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Completed', 'Cancelled'], default: 'Pending' },
  purpose: String,  // for walk-ins 
  isAnonymous: { type: Boolean, default: false },
  reservedByTechnician: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Reservation', reservationSchema);
