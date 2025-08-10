import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Payment from '../models/payment.js';
import Plan from '../models/Plan.js';

dotenv.config({ path: './.env' });

const MONGODB_URI = process.env.MONGODB_URI;

const migratePayments = async () => {
  if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI is not defined in the .env file.');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB database.');

    console.log('Fetching all plans from the database...');
    const allMainPlans = await Plan.find().lean();
    
    // Create a quick lookup map for all individual plans by their name and type
    const planMap = new Map();
    allMainPlans.forEach(mainPlan => {
      mainPlan.plans.forEach(individualPlan => {
        const key = `${mainPlan.type.toLowerCase()}-${individualPlan.name.toLowerCase()}`;
        planMap.set(key, individualPlan._id);
      });
    });
    console.log(`Mapped ${planMap.size} individual plans.`);

    console.log("Finding payments that need migration (missing 'plan' field)...");
    const paymentsToMigrate = await Payment.find({ plan: { $exists: false } });
    
    if (paymentsToMigrate.length === 0) {
      console.log('No payments found that require migration. Your database is up-to-date.');
      return;
    }

    console.log(`Found ${paymentsToMigrate.length} payments to migrate.`);
    let updatedCount = 0;
    let failedCount = 0;

    for (const payment of paymentsToMigrate) {
      const planType = payment.notes?.planType?.toLowerCase();
      const planName = payment.notes?.planName?.toLowerCase();

      if (!planType || !planName) {
        console.warn(`- Skipping payment ${payment._id}: Missing planType or planName in notes.`);
        failedCount++;
        continue;
      }

      const lookupKey = `${planType}-${planName}`;
      const individualPlanId = planMap.get(lookupKey);

      if (individualPlanId) {
        payment.plan = individualPlanId;
        await payment.save();
        console.log(`  ✅ Successfully updated payment ${payment._id} with Plan ID ${individualPlanId}.`);
        updatedCount++;
      } else {
        console.error(`  ❌ Failed to find a matching plan for payment ${payment._id} with key "${lookupKey}".`);
        failedCount++;
      }
    }

    console.log('\n--- Migration Summary ---');
    console.log(`Total payments processed: ${paymentsToMigrate.length}`);
    console.log(`✅ Successfully updated: ${updatedCount}`);
    console.log(`❌ Failed to update: ${failedCount}`);
    console.log('-------------------------\n');
    console.log('Migration process completed.');

  } catch (error) {
    console.error('An error occurred during the migration process:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
};

migratePayments();
