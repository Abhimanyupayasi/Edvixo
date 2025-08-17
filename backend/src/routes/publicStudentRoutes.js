import express from 'express';
import Student from '../models/Student.js';
import Institution from '../models/Institution.js';
import SchoolClass from '../models/SchoolClass.js';
import Batch from '../models/Batch.js';
import Course from '../models/Course.js';
import { requireStudentAuth } from '../middlewares/studentAuth.js';

const router = express.Router();

router.get('/me', requireStudentAuth, async (req,res)=>{
  try {
    const { sid, iid } = req.student;
    const [student, inst] = await Promise.all([
      Student.findOne({ _id: sid, institutionId: iid }).lean(),
      Institution.findById(iid).select('name type logoUrl contact').lean()
    ]);
    if (!student) return res.status(404).json({ success:false, message:'Not found' });
    let scope = null;
    if (student.classId) {
      const c = await SchoolClass.findById(student.classId).lean();
      scope = c ? { type:'class', name:c.name, section:c.section } : null;
    } else if (student.batchId) {
      const b = await Batch.findById(student.batchId).lean();
      scope = b ? { type:'batch', name:b.name, timing:b.timing } : null;
    } else if (student.courseId) {
      const c = await Course.findById(student.courseId).lean();
      scope = c ? { type:'course', name:c.name, durationMonths:c.durationMonths } : null;
    }
    res.json({ success:true, data: {
      institution: inst,
      student: {
        _id: student._id,
        name: student.name,
        rollNo: student.rollNo,
        admissionNo: student.admissionNo,
        gender: student.gender,
        dob: student.dob,
        email: student.email,
        phone: student.phone,
        address: student.address,
        city: student.city,
        state: student.state,
        pincode: student.pincode,
        parent: student.parent,
        fee: student.fee,
        status: student.status,
        admissionDate: student.admissionDate
      },
      scope
    }});
  } catch (e){ res.status(500).json({ success:false, message:e.message }); }
});

export default router;
