
// src/db/insertDealData.js
import 'dotenv/config';
import mongoose from 'mongoose';
import Deal from '../models/Deal.js';

// Sample Deal Data (unchanged)
const dealData = [
  {
    title: "Diwali Special",
    description: "Festive season discount for all plans",
    discountType: "percentage",
    value: 15,
    startAt: new Date("2024-11-01"),
    endAt: new Date("2024-11-15"),
    applicableTo: [],
    isActive: true
  },
  {
    title: "New Year Kickoff",
    description: "Start your new year with premium education",
    discountType: "flat",
    value: 2000,
    startAt: new Date("2024-12-25"),
    endAt: new Date("2025-01-10"),
    applicableTo: ["Gold", "Platinum"],
    isActive: true
  },
  {
    title: "Summer Crash Course",
    description: "Limited time summer intensive program discount",
    discountType: "percentage",
    value: 20,
    startAt: new Date("2024-05-15"),
    endAt: new Date("2024-06-15"),
    applicableTo: ["Crash Course"],
    isActive: false // Past deal
  },
  {
    title: "Foundation Week",
    description: "Discount for foundation program students",
    discountType: "flat",
    value: 1500,
    startAt: new Date("2024-09-01"),
    endAt: new Date("2024-09-07"),
    applicableTo: ["Foundation"],
    isActive: true
  },
  {
    title: "Referral Bonus",
    description: "Special discount when you refer a friend",
    discountType: "percentage",
    value: 10,
    startAt: new Date("2024-08-01"),
    endAt: new Date("2024-12-31"),
    applicableTo: [],
    isActive: true
  }
];

// Enhanced connection configuration
const MONGO_URI = "";

async function main() {
  try {
    console.log("Connecting to MongoDB...");
    
    // Enhanced connection options
    const connectionOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 50000,  // Increased timeout to 50 seconds
      socketTimeoutMS: 60000,          // Socket timeout 60 seconds
      connectTimeoutMS: 50000,         // Connection timeout 50 seconds
      maxPoolSize: 10,                 // Increased connection pool size
      retryWrites: true,
      retryReads: true
    };

    // Add event listeners for connection monitoring
    mongoose.connection.on('connecting', () => {
      console.log('Attempting to establish MongoDB connection...');
    });

    mongoose.connection.on('connected', () => {
      console.log('MongoDB connection established successfully');
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    // Establish connection
    await mongoose.connect(MONGO_URI, connectionOptions);
    console.log("Connected to MongoDB");

    // Clear existing deals
    console.log("Clearing existing deals...");
    await Deal.deleteMany({});
    console.log("Cleared existing deals");

    // Insert deal data
    console.log("Inserting new deals...");
    const result = await Deal.insertMany(dealData);
    console.log(`Successfully inserted ${result.length} deals`);

    // Close connection
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    process.exit(0);  // Explicit exit to ensure process termination

  } catch (error) {
    console.error("Error:", error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
}

// Execute with error handling
main().catch(err => {
  console.error('Unhandled error in main:', err);
  process.exit(1);
});