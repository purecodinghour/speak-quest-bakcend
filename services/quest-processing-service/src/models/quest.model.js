// models/quest.model.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const questSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  streak: { type: Number, required: true },  // 이 퀘스트를 완료하는 데 필요한 횟수
  duplication: { type: Number, default: 1 }, // 퀘스트 반복 수행 가능 여부
  reward_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Reward' },  // 연관된 보상
  auto_claim: { type: Boolean, default: false }, // 자동 보상 수령 여부
}, { timestamps: true });

module.exports = mongoose.model('Quest', questSchema);
