const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  userType: { type: String, enum: ['student', 'technician'] },
  // For students
  studentId: { type: String, unique: true, required: function() { return this.userType === 'student'; } },
  course: { type: String, required: function() { return this.userType === 'student'; } },
  // For technicians
  employeeId: { type: String,unique: true,  required: function() { return this.userType === 'technician'; } },
  department: { type: String, required: function() { return this.userType === 'technician'; } },
  profilePic: String,
  bio: String,
  rememberToken: String
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
