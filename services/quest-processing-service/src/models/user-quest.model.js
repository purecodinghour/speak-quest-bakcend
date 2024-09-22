const mongoose = require('mongoose');

const userQuestSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.Mixed, required: true, ref: 'User' },
  quest_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Quest' },
  status: { type: String, enum: ['in_progress', 'completed', 'claimed'], default: 'in_progress' },
  progress: { type: Number, default: 0 },
  completed_at: { type: Date },
  claimed_at: { type: Date }
});

module.exports = mongoose.model('UserQuest', userQuestSchema);

//userQuestSchema.index({ user_id: 1, quest_id: 1 });
