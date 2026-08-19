const mongoose = require('mongoose');

const statusUpdateSchema = new mongoose.Schema(
  {
    complaint_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
    },
    status: {
      type: String,
      enum: ['submitted', 'assigned', 'in_progress', 'resolved', 'closed'],
      required: true,
    },
    remarks: {
      type: String,
      trim: true,
    },
    updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: 'updated_at',
      updatedAt: false,
    },
  }
);

module.exports = mongoose.model('StatusUpdate', statusUpdateSchema);