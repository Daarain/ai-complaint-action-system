const mongoose = require('mongoose');

const complaintMediaSchema = new mongoose.Schema(
  {
    complaint_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
    },
    file_url: {
      type: String,
      required: true,
    },
    media_type: {
      type: String,
      enum: ['image', 'video', 'audio'],
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: 'uploaded_at',
      updatedAt: false,
    },
  }
);

module.exports = mongoose.model('ComplaintMedia', complaintMediaSchema);