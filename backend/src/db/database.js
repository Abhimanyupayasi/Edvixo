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
const mongoURI = process.env.MONGO_URI; // replace 'yourdbname' with your DB name

mongoose.connect(mongoURI);

const mongoDB = mongoose.connection;

mongoDB.on('error', (err) => {
  console.error('❌ MongoDB Connection Error:', err);
});

mongoDB.once('open', () => {
  console.log('✅ Connected to MongoDB database');
});

// Export both connections
export { mongoDB };
