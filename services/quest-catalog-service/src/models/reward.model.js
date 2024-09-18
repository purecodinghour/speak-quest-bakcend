const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  reward_name: { type: String, required: true },
  reward_item: { type: String, enum: ['gold', 'diamond'], required: true },
  reward_qty: { type: Number, required: true }
});

module.exports = mongoose.model('Reward', rewardSchema);