// src/index.js
import app from './app.js';
import dotenv from 'dotenv';
dotenv.config();
import connectDB from './src/db/database.js';

connectDB()
  .then(() => {
    console.log('✅ MongoDB connected successfully.');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  });

 


const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});