import mongoose from 'mongoose';
import Plan from '../models/Plan.js';
import Feature from '../models/Feature.js';
import connectDB from '../db/database.js';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const runMigration = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB for linking plans to features...');

    // Step 1: Get all features and create a map from key to _id
    const allFeatures = await Feature.find({}).lean();
    const featureMap = new Map(allFeatures.map(f => [f.key, f._id]));
    console.log(`Loaded ${featureMap.size} features into map.`);

    // Step 2: Get all plan categories
    const planCategories = await Plan.find({});
    console.log(`Found ${planCategories.length} plan categories to update.`);

    let updatedCount = 0;

    // Step 3: Iterate through each plan and update its features array
    for (const category of planCategories) {
      let isModified = false;
      for (const individualPlan of category.plans) {
        const newFeaturesArray = [];
        // The features are still in the old format in the DB
        const oldFeatures = individualPlan.toObject().features;

        if (oldFeatures && oldFeatures.length > 0 && oldFeatures[0].key) {
            for (const oldFeature of oldFeatures) {
                const featureId = featureMap.get(oldFeature.key);
                if (featureId) {
                    newFeaturesArray.push({
                        feature: featureId,
                        isIncluded: oldFeature.isIncluded
                    });
                } else {
                    console.warn(`Warning: Feature with key "${oldFeature.key}" not found for plan "${individualPlan.name}".`);
                }
            }
            // Replace the old features array with the new one
            individualPlan.features = newFeaturesArray;
            isModified = true;
        }
      }

      if (isModified) {
        await category.save();
        updatedCount++;
        console.log(`Updated plan category: ${category.type}`);
      }
    }

    console.log(`Successfully updated ${updatedCount} plan categories.`);

  } catch (error) {
    console.error('Error during plan-feature linking migration:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
  }
};

runMigration();
