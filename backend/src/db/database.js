// database.js
// import mysql from 'mysql2';
import mongoose from 'mongoose';

// ==== MySQL Connection ====
// const mysqlConnection = mysql.createConnection({
//   host: process.env.MYSQL_HOST,
//   user: process.env.MYSQL_USER,
//   password: process.env.MYSQL_PASSWORD,
//   database: process.env.MYSQL_DATABASE,
//   port: process.env.MYSQL_PORT,
// });

// mysqlConnection.connect((err) => {
//   if (err) {
//     console.error('❌ MySQL Connection Failed:', err);
//   } else {
//     console.log('✅ Connected to MySQL database');
//   }
// });

// ==== MongoDB Connection ====
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState >= 1) {
      return;
    }
    await mongoose.connect(process.env.MONGO_URI);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

mongoose.connection.on('connected', () => {
  console.log('✅ Connected to MongoDB database');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB Connection Error:', err);
});

export default connectDB;
