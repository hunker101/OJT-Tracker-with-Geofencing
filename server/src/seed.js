import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import OJTSite from './models/OJTSite.js';

dotenv.config();

const seedData = async () => {
  await connectDB();
  
  try {
    await OJTSite.deleteMany();
    
    // Sample OJT Site (e.g. A mall or office in Manila)
    const site = new OJTSite({
        name: 'TechHub Offices',
        address: '123 Innovation Drive, Tech City',
        location: {
            lat: 14.5547, // Makati approx
            lng: 121.0244
        },
        radius_meters: 200
    });
    
    await site.save();
    console.log('Seed data imported: OJTSite created');
    process.exit();
  } catch (error) {
    console.error('Error importing seed data', error);
    process.exit(1);
  }
};

seedData();
