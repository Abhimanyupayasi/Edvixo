import { mysqlConnection as db } from './database.js';

const assignClassTeacher = async () => {
  try {
    const assignQuery = `
      INSERT INTO batch_class_teacher (batch_id, teacher_id)
      VALUES (?, ?)
    `;
    const assignValues = [1, 1]; // Use the actual batch and teacher IDs
    await db.promise().query(assignQuery, assignValues);
    console.log("✅ Class teacher assigned to batch.");
  } catch (err) {
    console.error("❌ Class Teacher Insert Error:", err.message);
  }
};

assignClassTeacher();
