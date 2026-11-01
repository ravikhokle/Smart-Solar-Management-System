import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const voiceConversationSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    startTime: {
      type: Date,
      default: Date.now,
      index: true,
    },
    endTime: {
      type: Date,
    },
    durationSeconds: {
      type: Number,
      default: 0,
    },
    language: {
      type: String,
      default: 'en',
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'failed', 'abandoned'],
      default: 'active',
      index: true,
    },
    enquirySubmitted: {
      type: Boolean,
      default: false,
      index: true,
    },
    enquiry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Enquiry',
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
    },
    submissionStatus: {
      type: String,
      enum: ['none', 'success', 'failed'],
      default: 'none',
      index: true,
    },
    submissionError: {
      type: String,
      default: '',
    },
    idempotencyKey: {
      type: String,
      index: true,
      sparse: true,
    },
    messagesCount: {
      type: Number,
      default: 0,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
    // Transcripts are optional and stored only if consent or configuration allows
    transcript: [messageSchema],
  },
  { timestamps: true }
);

voiceConversationSchema.index({ createdAt: -1 });

export const VoiceConversation = mongoose.model('VoiceConversation', voiceConversationSchema);

