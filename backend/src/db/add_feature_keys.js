// d:/SMS/backend/src/db/add_feature_keys.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Plan from '../models/Plan.js';

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Generates a URL-friendly and code-friendly key from a title.
 * Example: "24/7 Support" -> "24_7_support"
 * @param {string} title The title of the feature.
 * @returns {string} The generated key.
 */
const generateKeyFromTitle = (title) => {
  if (!title) return `feature_${Date.now()}`; // Fallback for empty titles
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters except spaces
    .replace(/\s+/g, '_');      // Replace spaces with underscores
};

const addKeysToFeatures = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('Error: MONGODB_URI is not defined in your .env file.');
    process.exit(1);
  }

  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Database connected successfully.');

    const plans = await Plan.find({});
    console.log(`Found ${plans.length} plan document(s) to process.`);

    let updatedPlansCount = 0;
    let updatedFeaturesCount = 0;

    for (const plan of plans) {
      let isPlanModified = false;
      for (const individualPlan of plan.plans) {
        for (const feature of individualPlan.features) {
          // Check if the key is missing or empty
          if (!feature.key) {
            feature.key = generateKeyFromTitle(feature.title);
            isPlanModified = true;
            updatedFeaturesCount++;
            console.log(`  - Plan '${individualPlan.name}': Added key '${feature.key}' for feature '${feature.title}'`);
          }
        }
      }

      if (isPlanModified) {
        await plan.save();
        updatedPlansCount++;
        console.log(`-> Saved updated plan document: ${plan.type} (ID: ${plan._id})`);
      }
    }

    console.log('\n--- Migration Summary ---');
    if (updatedPlansCount > 0) {
      console.log(`Successfully updated ${updatedPlansCount} plan document(s).`);
      console.log(`A total of ${updatedFeaturesCount} features were assigned a key.`);
    } else {
      console.log('No plans required updates. All features already have keys.');
    }
    console.log('--------------------------');

  } catch (error) {
    console.error('\nAn error occurred during the migration process:');
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDatabase connection closed.');
  }
};

addKeysToFeatures();
