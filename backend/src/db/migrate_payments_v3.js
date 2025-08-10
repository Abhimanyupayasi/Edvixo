import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Payment from '../models/payment.js';
import Plan from '../models/Plan.js';

dotenv.config({ path: './.env' });

const MONGODB_URI = process.env.MONGODB_URI;

const migratePaymentsV3 = async () => {
  if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI is not defined in the .env file.');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB database.');

    console.log('Fetching all plans and creating a lookup map...');
    const allMainPlans = await Plan.find().lean();
    
    const planMap = new Map();
    const planDetailsMap = new Map();

    allMainPlans.forEach(mainPlan => {
      mainPlan.plans.forEach(individualPlan => {
        const typeKey = mainPlan.type?.toLowerCase().trim() || 'unknown';
        const nameKey = individualPlan.name?.toLowerCase().trim() || 'unknown';
        const key = `${typeKey}-${nameKey}`;
        if (!planMap.has(key)) {
            planMap.set(key, individualPlan._id);
            planDetailsMap.set(individualPlan._id.toString(), individualPlan);
        }
      });
    });
    console.log(`Mapped ${planMap.size} individual plans.`);

    console.log("Finding payments that need migration (missing 'plan' or 'pricingTier')...");
    const paymentsToMigrate = await Payment.find({ 
      $or: [
        { plan: { $exists: false } },
        { pricingTier: { $exists: false } }
      ]
    });
    
    if (paymentsToMigrate.length === 0) {
      console.log('No payments found that require migration. Your database is up-to-date.');
      return;
    }

    console.log(`Found ${paymentsToMigrate.length} payments to migrate.`);
    let updatedCount = 0;
    let failedCount = 0;

    for (const payment of paymentsToMigrate) {
      try {
        let planType = payment.notes?.get('planType')?.toLowerCase().trim();
        let planName = payment.notes?.get('planName')?.toLowerCase().trim();
        
        if (!planType && payment.notes?.planType) planType = payment.notes.planType.toLowerCase().trim();
        if (!planName && payment.notes?.planName) planName = payment.notes.planName.toLowerCase().trim();

        if (planType && !planName) {
          if (planType.includes('basic')) planName = 'silver plan';
          else if (planType.includes('premium')) planName = 'premium plan';
          if (planType.includes('coaching')) planType = 'coaching';
        }

        if (!planType || !planName) {
          console.warn(`- Skipping payment ${payment._id}: Could not determine planType or planName.`);
          failedCount++;
          continue;
        }

        const lookupKey = `${planType}-${planName}`;
        const individualPlanId = planMap.get(lookupKey);

        if (individualPlanId) {
          payment.plan = individualPlanId;

          // If pricingTier is missing, create a placeholder
          if (!payment.pricingTier || Object.keys(payment.pricingTier).length === 0) {
            const planDetails = planDetailsMap.get(individualPlanId.toString());
            let matchedTier = planDetails?.pricingTiers.find(t => t.discountPrice === payment.amount) || planDetails?.pricingTiers[0];
            
            if (matchedTier) {
              payment.pricingTier = {
                duration: matchedTier.duration,
                basePrice: matchedTier.basePrice,
                discountPrice: matchedTier.discountPrice,
                currency: matchedTier.currency,
                _id: matchedTier._id
              };
            } else {
              // Create a generic fallback if no tier matches
              payment.pricingTier = {
                duration: 1,
                basePrice: payment.amount,
                discountPrice: payment.amount,
                currency: 'INR',
                description: 'Tier inferred during migration'
              };
            }
             console.log(`  🔧 Inferred pricing tier for payment ${payment._id}.`);
          }
          
          await payment.save();
          console.log(`  ✅ Successfully updated payment ${payment._id} with Plan ID ${individualPlanId}.`);
          updatedCount++;
        } else {
          console.error(`  ❌ Failed to find a matching plan for payment ${payment._id} with key "${lookupKey}".`);
          failedCount++;
        }
      } catch (err) {
        console.error(`  🔥 Error processing payment ${payment._id}:`, err.message);
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

migratePaymentsV3();
