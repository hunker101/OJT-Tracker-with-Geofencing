import mongoose from 'mongoose';

const holidaySchema = new mongoose.Schema({
  date: { type: Date, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['regular', 'special'], default: 'regular' }
}, { timestamps: true });

export default mongoose.model('Holiday', holidaySchema);
