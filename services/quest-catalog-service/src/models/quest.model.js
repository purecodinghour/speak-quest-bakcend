const mongoose = require('mongoose');

const questSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  reward_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Reward' },
  duplication: { type: Number, default: 1 },
  auto_claim: { type: Boolean, default: false },
  streak: { type: Number, default: 1 },
  duplication: { type: Number, default: 1 }
});

// 자주 조회하는 필드에 인덱스 추가
questSchema.index({ name: 1 });
questSchema.index({ reward_id: 1 });

module.exports = mongoose.model('Quest', questSchema);