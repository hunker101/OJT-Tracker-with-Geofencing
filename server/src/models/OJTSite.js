import mongoose from 'mongoose';

const ojtSiteSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: String,
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  radius_meters: { type: Number, default: 150 }
}, { timestamps: true });

export default mongoose.model('OJTSite', ojtSiteSchema);
