const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  user_name: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  gold: { type: Number, default: 0 },
  diamond: { type: Number, default: 0 },
  status: { type: String, enum: ['new', 'not_new', 'banned'], default: 'new' }
});

// 자주 조회하는 필드에 인덱스 추가
userSchema.index({ user_name: 1 });

module.exports = mongoose.model('User', userSchema);