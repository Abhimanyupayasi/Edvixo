import mongoose from 'mongoose';
import Plan from '../models/Plan.js';
import Feature from '../models/Feature.js';
import connectDB from '../db/database.js';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const runMigration = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB for feature migration...');

    // Step 1: Extract all unique features from all plans
    const allPlans = await Plan.find({}).lean();
    const uniqueFeaturesMap = new Map();

    allPlans.forEach(planCategory => {
      planCategory.plans.forEach(individualPlan => {
        individualPlan.features.forEach(feature => {
          if (feature.key && !uniqueFeaturesMap.has(feature.key)) {
            uniqueFeaturesMap.set(feature.key, {
              key: feature.key,
              title: feature.title,
              description: feature.description,
              category: planCategory.type // Assign category from plan type
            });
          }
        });
      });
    });

    const featuresToInsert = Array.from(uniqueFeaturesMap.values());
    console.log(`Found ${featuresToInsert.length} unique features to migrate.`);

    if (featuresToInsert.length === 0) {
      console.log('No new features to migrate.');
      return;
    }

    // Step 2: Insert new features into the Feature collection
    // Using updateOne with upsert to avoid duplicates on re-runs
    const operations = featuresToInsert.map(feature => ({
      updateOne: {
        filter: { key: feature.key },
        update: { $set: feature },
        upsert: true
      }
    }));

    const result = await Feature.bulkWrite(operations);
    console.log('Bulk write result:', result);
    console.log('Successfully migrated features to the new collection.');

  } catch (error) {
    console.error('Error during feature migration:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
  }
};

runMigration();
