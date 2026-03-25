import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  siteId: { type: mongoose.Schema.Types.ObjectId, ref: 'OJTSite' },
  workMode: { type: String, enum: ['onsite', 'wfh'], required: true },
  session: { type: String, enum: ['AM', 'PM', 'WFH'], required: true },
  clockIn: { type: Date, required: true },
  clockOut: { type: Date },
  durationMinutes: { type: Number },
  method: { type: String, enum: ['auto', 'manual'], default: 'auto' },
  edited: { type: Boolean, default: false },
  editReason: { type: String },
  location: {
    lat: Number,
    lng: Number
  }
}, { timestamps: true });

export default mongoose.model('Attendance', attendanceSchema);
