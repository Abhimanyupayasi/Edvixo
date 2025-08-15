import express from 'express';
import { requireAuth, getAuth } from '@clerk/express';
import { createOrUpdateDraft, publishInstitution, getInstitutionBySubdomain, getMyInstitution, updateInstitution, requestCustomDomain, verifyCustomDomain } from '../controllers/institutionController.js';
import Institution from '../models/Institution.js';
import SchoolClass from '../models/SchoolClass.js';
import Batch from '../models/Batch.js';
import Course from '../models/Course.js';
import Student from '../models/Student.js';
import Counter from '../models/Counter.js';
import Plan from '../models/Plan.js';

const ensureEditable = async (req,res,next) => {
	try {
		const { id } = req.body;
		if (!id) return next();
		const { userId } = getAuth(req) || {};
		if(!userId) return res.status(401).json({ success:false, message:'Unauthorized' });
		const inst = await Institution.findById(id).select('status ownerClerkUserId');
		if (!inst) return res.status(404).json({ success:false, message:'not found' });
		if (inst.ownerClerkUserId !== userId) return res.status(403).json({ success:false, message:'forbidden' });
		next();
	} catch (e) {
		console.error('ensureEditable error:', e);
		res.status(500).json({ success:false, message:e.message });
	}
};

const router = express.Router();

// debug log each institutions request path
router.use((req,res,next)=>{
	console.log('[institutions] incoming', req.method, req.originalUrl);
	next();
});

router.post('/draft', requireAuth(), ensureEditable, createOrUpdateDraft);
router.post('/publish/:id', requireAuth(), publishInstitution);
router.put('/update/:id', requireAuth(), updateInstitution);
router.get('/public/:subdomain', getInstitutionBySubdomain);
// custom domain management
router.post('/:id/custom-domain/request', requireAuth(), requestCustomDomain);
router.post('/:id/custom-domain/verify', requireAuth(), verifyCustomDomain);
// fetch institutions for current user (plan filter optional)
router.get('/mine', requireAuth(), async (req,res)=>{
	const started = Date.now();
	try {
		const { userId } = getAuth(req) || {};
		const { planId } = req.query; // optional
		if(!userId) return res.status(401).json({ success:false, message:'Unauthorized'});
		const filter = { ownerClerkUserId: userId };
		if (planId && typeof planId === 'string' && planId.trim()) {
			filter.sourcePlanId = planId.trim();
		}
		console.log('[institutions/mine] query', { userId, planId, filter });
			let list;
				if (planId) {
				// return full single institution (one-per-plan) for editing
				const inst = await Institution.findOne(filter).lean();
				list = inst ? [inst] : [];
			} else {
					list = await Institution.find(filter).select('name slug status publicUrl sourcePlanId type').lean();
			}
		// Fallback: if planId provided but none linked yet, try to auto-link oldest orphan institution
		if (planId && list.length === 0) {
			const orphan = await Institution.findOne({ ownerClerkUserId:userId, $or:[{ sourcePlanId: { $exists:false } }, { sourcePlanId: null }, { sourcePlanId: '' }] }).sort({ createdAt:1 });
			if (orphan) {
				console.log('[institutions/mine] backfilling sourcePlanId on orphan', orphan._id.toString(), '->', planId);
				orphan.sourcePlanId = planId;
				await orphan.save();
				list = await Institution.find({ ownerClerkUserId:userId, sourcePlanId:planId }).select('name slug status publicUrl sourcePlanId type').lean();
			}
		}
		console.log('[institutions/mine] result count', list.length, 'duration ms', Date.now()-started);
		res.json({ success:true, data:list });
	} catch (e) {
		console.error('[institutions/mine] error', e);
		res.status(500).json({ success:false, message:e.message, code:'INSTITUTIONS_MINE_FAILED' });
	}
});
// get institution by id for owner (avoid conflict with /mine by using /by-id/)
// (temporarily removed /by-id route until needed to avoid ambiguity)

export default router;

// ---- Type-based entities: classes (school), batches (coaching), courses (college) ----

// ---- Roll number helpers (duplicated from studentRoutes; consider refactor later) ----
async function getInstitutionCode(inst) {
	if (typeof inst.instCode === 'number' && inst.instCode >= 0) return inst.instCode;
	const c = await Counter.findOneAndUpdate(
		{ key: 'institution-code' },
		{ $inc: { value: 1 } },
		{ upsert: true, new: true }
	);
	inst.instCode = c.value;
	await inst.save();
	return inst.instCode;
}
async function nextStudentSeq(instId, yearYY, count = 1) {
	const key = `student-seq:${instId.toString()}:${yearYY}`;
	const c = await Counter.findOneAndUpdate(
		{ key },
		{ $inc: { value: count } },
		{ upsert: true, new: true }
	);
	const end = c.value;
	const start = end - count + 1;
	return { start, end };
}
function makeRollNo(instCode, instName, yearYY, seq) {
	const code4 = String(instCode).padStart(4,'0');
	const letters = (instName||'').replace(/[^a-z]/ig,'').slice(0,2).toUpperCase();
	const yy = String(yearYY).padStart(2,'0');
	const seq4 = String(seq).padStart(4,'0');
	return `${code4}${letters}${yy}${seq4}`;
}
router.post('/:id/classes', requireAuth(), async (req,res)=>{
	try {
		const { id } = req.params; const { name, section, grade, description } = req.body;
		const { userId } = getAuth(req) || {};
		if(!userId) return res.status(401).json({ success:false, message:'Unauthorized' });
		if(!name) return res.status(400).json({ success:false, message:'name required' });
		const inst = await Institution.findOne({ _id:id, ownerClerkUserId:userId });
		if(!inst) return res.status(404).json({ success:false, message:'institution not found' });
		if(inst.type !== 'school') return res.status(400).json({ success:false, message:'Only schools can create classes' });
		const item = await SchoolClass.create({ institutionId: inst._id, name, section, grade, description });
		res.json({ success:true, data:item });
	} catch (e){ res.status(500).json({ success:false, message:e.message }); }
});

router.get('/:id/classes', requireAuth(), async (req,res)=>{
	try {
		const { id } = req.params; const { userId } = getAuth(req) || {};
		if(!userId) return res.status(401).json({ success:false, message:'Unauthorized' });
		const inst = await Institution.findOne({ _id:id, ownerClerkUserId:userId });
		if(!inst) return res.status(404).json({ success:false, message:'institution not found' });
		if(inst.type !== 'school') return res.status(400).json({ success:false, message:'Only schools have classes' });
		const list = await SchoolClass.find({ institutionId: inst._id }).sort({ createdAt:-1 });
		res.json({ success:true, data:list });
	} catch (e){ res.status(500).json({ success:false, message:e.message }); }
});

// update a class (school only)
router.put('/:id/classes/:classId', requireAuth(), async (req,res)=>{
	try {
		const { id, classId } = req.params; const { name, section, grade, description } = req.body; const { userId } = getAuth(req) || {};
		if(!userId) return res.status(401).json({ success:false, message:'Unauthorized' });
		const inst = await Institution.findOne({ _id:id, ownerClerkUserId:userId });
		if(!inst) return res.status(404).json({ success:false, message:'institution not found' });
		if(inst.type !== 'school') return res.status(400).json({ success:false, message:'Only schools can update classes' });
		const cls = await SchoolClass.findOneAndUpdate({ _id:classId, institutionId: inst._id }, { $set: { name, section, grade, description } }, { new:true });
		if(!cls) return res.status(404).json({ success:false, message:'class not found' });
		res.json({ success:true, data:cls });
	} catch (e){ res.status(500).json({ success:false, message:e.message }); }
});

// delete a class (school only)
router.delete('/:id/classes/:classId', requireAuth(), async (req,res)=>{
	try {
		const { id, classId } = req.params; const { userId } = getAuth(req) || {};
		if(!userId) return res.status(401).json({ success:false, message:'Unauthorized' });
		const inst = await Institution.findOne({ _id:id, ownerClerkUserId:userId });
		if(!inst) return res.status(404).json({ success:false, message:'institution not found' });
		if(inst.type !== 'school') return res.status(400).json({ success:false, message:'Only schools can delete classes' });
		const del = await SchoolClass.findOneAndDelete({ _id:classId, institutionId: inst._id });
		if(!del) return res.status(404).json({ success:false, message:'class not found' });
		res.json({ success:true });
	} catch (e){ res.status(500).json({ success:false, message:e.message }); }
});

router.post('/:id/batches', requireAuth(), async (req,res)=>{
	try {
		const { id } = req.params; const { name, timing, description } = req.body;
		const { userId } = getAuth(req) || {};
		if(!userId) return res.status(401).json({ success:false, message:'Unauthorized' });
		if(!name) return res.status(400).json({ success:false, message:'name required' });
		const inst = await Institution.findOne({ _id:id, ownerClerkUserId:userId });
		if(!inst) return res.status(404).json({ success:false, message:'institution not found' });
		if(inst.type !== 'coaching') return res.status(400).json({ success:false, message:'Only coaching can create batches' });
		const item = await Batch.create({ institutionId: inst._id, name, timing, description });
		res.json({ success:true, data:item });
	} catch (e){ res.status(500).json({ success:false, message:e.message }); }
});

router.get('/:id/batches', requireAuth(), async (req,res)=>{
	try {
		const { id } = req.params; const { userId } = getAuth(req) || {};
		if(!userId) return res.status(401).json({ success:false, message:'Unauthorized' });
		const inst = await Institution.findOne({ _id:id, ownerClerkUserId:userId });
		if(!inst) return res.status(404).json({ success:false, message:'institution not found' });
		if(inst.type !== 'coaching') return res.status(400).json({ success:false, message:'Only coaching have batches' });
		const list = await Batch.find({ institutionId: inst._id }).sort({ createdAt:-1 });
		res.json({ success:true, data:list });
	} catch (e){ res.status(500).json({ success:false, message:e.message }); }
});

router.put('/:id/batches/:batchId', requireAuth(), async (req,res)=>{
	try {
		const { id, batchId } = req.params; const { name, timing, description } = req.body; const { userId } = getAuth(req) || {};
		if(!userId) return res.status(401).json({ success:false, message:'Unauthorized' });
		const inst = await Institution.findOne({ _id:id, ownerClerkUserId:userId });
		if(!inst) return res.status(404).json({ success:false, message:'institution not found' });
		if(inst.type !== 'coaching') return res.status(400).json({ success:false, message:'Only coaching can update batches' });
		const item = await Batch.findOneAndUpdate({ _id:batchId, institutionId: inst._id }, { $set: { name, timing, description } }, { new:true });
		if(!item) return res.status(404).json({ success:false, message:'batch not found' });
		res.json({ success:true, data:item });
	} catch (e){ res.status(500).json({ success:false, message:e.message }); }
});

router.delete('/:id/batches/:batchId', requireAuth(), async (req,res)=>{
	try {
		const { id, batchId } = req.params; const { userId } = getAuth(req) || {};
		if(!userId) return res.status(401).json({ success:false, message:'Unauthorized' });
		const inst = await Institution.findOne({ _id:id, ownerClerkUserId:userId });
		if(!inst) return res.status(404).json({ success:false, message:'institution not found' });
		if(inst.type !== 'coaching') return res.status(400).json({ success:false, message:'Only coaching can delete batches' });
		const del = await Batch.findOneAndDelete({ _id:batchId, institutionId: inst._id });
		if(!del) return res.status(404).json({ success:false, message:'batch not found' });
		res.json({ success:true });
	} catch (e){ res.status(500).json({ success:false, message:e.message }); }
});

router.post('/:id/courses', requireAuth(), async (req,res)=>{
	try {
		const { id } = req.params; const { name, durationMonths, description } = req.body;
		const { userId } = getAuth(req) || {};
		if(!userId) return res.status(401).json({ success:false, message:'Unauthorized' });
		if(!name || !durationMonths) return res.status(400).json({ success:false, message:'name and durationMonths required' });
		const inst = await Institution.findOne({ _id:id, ownerClerkUserId:userId });
		if(!inst) return res.status(404).json({ success:false, message:'institution not found' });
		if(inst.type !== 'college') return res.status(400).json({ success:false, message:'Only colleges can create courses' });
		const item = await Course.create({ institutionId: inst._id, name, durationMonths, description });
		res.json({ success:true, data:item });
	} catch (e){ res.status(500).json({ success:false, message:e.message }); }
});

router.get('/:id/courses', requireAuth(), async (req,res)=>{
	try {
		const { id } = req.params; const { userId } = getAuth(req) || {};
		if(!userId) return res.status(401).json({ success:false, message:'Unauthorized' });
		const inst = await Institution.findOne({ _id:id, ownerClerkUserId:userId });
		if(!inst) return res.status(404).json({ success:false, message:'institution not found' });
		if(inst.type !== 'college') return res.status(400).json({ success:false, message:'Only colleges have courses' });
		const list = await Course.find({ institutionId: inst._id }).sort({ createdAt:-1 });
		res.json({ success:true, data:list });
	} catch (e){ res.status(500).json({ success:false, message:e.message }); }
});

	router.put('/:id/courses/:courseId', requireAuth(), async (req,res)=>{
		try {
			const { id, courseId } = req.params; const { name, durationMonths, description } = req.body; const { userId } = getAuth(req) || {};
			if(!userId) return res.status(401).json({ success:false, message:'Unauthorized' });
			const inst = await Institution.findOne({ _id:id, ownerClerkUserId:userId });
			if(!inst) return res.status(404).json({ success:false, message:'institution not found' });
			if(inst.type !== 'college') return res.status(400).json({ success:false, message:'Only colleges can update courses' });
			const item = await Course.findOneAndUpdate({ _id:courseId, institutionId: inst._id }, { $set: { name, durationMonths, description } }, { new:true });
			if(!item) return res.status(404).json({ success:false, message:'course not found' });
			res.json({ success:true, data:item });
		} catch (e){ res.status(500).json({ success:false, message:e.message }); }
	});

	router.delete('/:id/courses/:courseId', requireAuth(), async (req,res)=>{
		try {
			const { id, courseId } = req.params; const { userId } = getAuth(req) || {};
			if(!userId) return res.status(401).json({ success:false, message:'Unauthorized' });
			const inst = await Institution.findOne({ _id:id, ownerClerkUserId:userId });
			if(!inst) return res.status(404).json({ success:false, message:'institution not found' });
			if(inst.type !== 'college') return res.status(400).json({ success:false, message:'Only colleges can delete courses' });
			const del = await Course.findOneAndDelete({ _id:courseId, institutionId: inst._id });
			if(!del) return res.status(404).json({ success:false, message:'course not found' });
			res.json({ success:true });
		} catch (e){ res.status(500).json({ success:false, message:e.message }); }
	});

	// ---- Students under a School Class (School type only) ----
	router.post('/:id/classes/:classId/students', requireAuth(), async (req,res)=>{
		try {
			const { id, classId } = req.params;
			const { name, admissionNo, gender, dob, email, phone, address, city, state, pincode, parent, fee, admissionDate, status } = req.body;
			const { userId } = getAuth(req) || {};
			if(!userId) return res.status(401).json({ success:false, message:'Unauthorized' });
			if(!name) return res.status(400).json({ success:false, message:'name required' });
			const inst = await Institution.findOne({ _id:id, ownerClerkUserId:userId });
			if(!inst) return res.status(404).json({ success:false, message:'institution not found' });
			if(inst.type !== 'school') return res.status(400).json({ success:false, message:'Only schools can add students to classes' });
			// capacity check
			if (!(await ensureCapacityOrReject(inst, 1, res))) return;
			const cls = await SchoolClass.findOne({ _id: classId, institutionId: inst._id });
			if(!cls) return res.status(404).json({ success:false, message:'class not found' });
			// Generate our roll number always (sync counter)
			const instCode = await getInstitutionCode(inst);
			const yearYY = String(new Date().getFullYear()).slice(2);
			const letters = (inst.name||'').replace(/[^a-z]/ig,'').slice(0,2).toUpperCase();
			const prefix = `${String(instCode).padStart(4,'0')}${letters}${yearYY}`;
			const key = `student-seq:${inst._id.toString()}:${yearYY}`;
			let cur = await Counter.findOne({ key });
			if (!cur) {
				const top = await Student.findOne({ institutionId: inst._id, rollNo: { $regex: `^${prefix}` } }).sort({ rollNo: -1 }).select('rollNo').lean();
				const current = top?.rollNo ? (parseInt(top.rollNo.slice(-4),10) || 0) : 0;
				cur = await Counter.create({ key, value: current });
			} else {
				const hasAny = await Student.exists({ institutionId: inst._id, rollNo: { $regex: `^${prefix}` } });
				if (!hasAny && cur.value > 0) { cur.value = 0; await cur.save(); }
			}
			const { start } = await nextStudentSeq(inst._id, yearYY, 1);
			const genRoll = makeRollNo(instCode, inst.name, yearYY, start);
			const item = await Student.create({
				institutionId: inst._id, classId: cls._id, name, rollNo: genRoll, admissionNo, gender, dob, email, phone,
				address, city, state, pincode, parent, fee, admissionDate, status
			});
			res.json({ success:true, data:item });
		} catch (e){ res.status(500).json({ success:false, message:e.message }); }
	});

// Capacity summary for an institution (used by StudentsPage)
router.get('/:id/students/summary', requireAuth(), async (req,res)=>{
	try {
		const { id } = req.params; const { userId } = getAuth(req) || {};
		if(!userId) return res.status(401).json({ success:false, message:'Unauthorized' });
		const inst = await Institution.findOne({ _id:id, ownerClerkUserId:userId });
		if(!inst) return res.status(404).json({ success:false, message:'institution not found' });
		const [count, limit] = await Promise.all([
			Student.countDocuments({ institutionId: inst._id }),
			getInstitutionStudentLimit(inst)
		]);
		// Flatten response so frontend can read .data.count directly
		res.json({ success:true, count, limit });
	} catch (e){ res.status(500).json({ success:false, message:e.message }); }
});

	router.get('/:id/classes/:classId/students', requireAuth(), async (req,res)=>{
		try {
			const { id, classId } = req.params; const { userId } = getAuth(req) || {};
			if(!userId) return res.status(401).json({ success:false, message:'Unauthorized' });
			const inst = await Institution.findOne({ _id:id, ownerClerkUserId:userId });
			if(!inst) return res.status(404).json({ success:false, message:'institution not found' });
			if(inst.type !== 'school') return res.status(400).json({ success:false, message:'Only schools have class students' });
			const cls = await SchoolClass.findOne({ _id: classId, institutionId: inst._id });
			if(!cls) return res.status(404).json({ success:false, message:'class not found' });
			const list = await Student.find({ institutionId: inst._id, classId: cls._id }).sort({ createdAt:-1 });
			res.json({ success:true, data:list });
		} catch (e){ res.status(500).json({ success:false, message:e.message }); }
	});

		// Alternative: class-level routes with owner check via class -> institution
		router.get('/classes/:classId/students', requireAuth(), async (req,res)=>{
			try {
				const { classId } = req.params; const { userId } = getAuth(req) || {};
				if(!userId) return res.status(401).json({ success:false, message:'Unauthorized' });
			const cls = await SchoolClass.findById(classId).lean();
			if(!cls) return res.json({ success:true, data:[] });
			const inst = await Institution.findOne({ _id: cls.institutionId, ownerClerkUserId: userId });
			if(!inst) return res.json({ success:true, data:[] });
			if(inst.type !== 'school') return res.json({ success:true, data:[] });
				const list = await Student.find({ institutionId: inst._id, classId: cls._id }).sort({ createdAt:-1 });
				res.json({ success:true, data:list });
			} catch (e){ res.status(500).json({ success:false, message:e.message }); }
		});

	// ---- Capacity guard and helpers ----
	async function getInstitutionStudentLimit(inst) {
		try {
			// Priority 1: check if parent plan group has explicit limits in sub-plan (legacy field not in schema)
			// Priority 2: parse features for keys like max-students-200 or description like "Up to 100 students"/"Max Capacity"
			// We have Institution.sourcePlanId storing the purchased individual plan id
			if (!inst?.sourcePlanId) return null; // no limit info
			const parent = await Plan.findOne({ 'plans._id': inst.sourcePlanId }).lean();
			if (!parent) return null;
			const sub = parent.plans.find(p => p._id.toString() === inst.sourcePlanId.toString());
			if (!sub) return null;
			// Check structured limits if any (not present in schema typically)
			if (sub.limits && typeof sub.limits.maxStudents === 'number') return sub.limits.maxStudents;
			// Parse features array with populated or plain references
			const feats = (sub.features || []).filter(f => f.isIncluded);
			let max = null;
			for (const f of feats) {
				const feat = f.feature && typeof f.feature === 'object' ? f.feature : f; // handle populated or raw
				const key = feat.key || '';
				const desc = feat.description || '';
				if (/^max-students-(\d+)$/i.test(key)) {
					const n = Number(key.match(/(\d+)/)[1]);
					max = Math.max(max ?? 0, n);
				}
				if ((feat.title||'').toLowerCase().includes('max capacity') || key === 'max_capacity') {
					const m = desc.match(/(\d[\d,]*)/);
					if (m) {
						const n = Number(m[1].replace(/,/g,''));
						max = Math.max(max ?? 0, n);
					}
				}
			}
			return max;
		} catch { return null; }
	}

	async function getInstitutionStudentCount(instId) {
		return Student.countDocuments({ institutionId: instId });
	}

	async function ensureCapacityOrReject(inst, delta, res) {
		const limit = await getInstitutionStudentLimit(inst);
		if (!limit || limit <= 0) return true; // no limit information means unlimited
		const count = await getInstitutionStudentCount(inst._id);
		if (count + delta > limit) {
			res.status(400).json({ success:false, message:`Student limit reached (${count}/${limit}). Upgrade plan or remove students.` });
			return false;
		}
		return true;
	}

	// ---- Students under a Batch (Coaching) ----
	router.get('/batches/:batchId/students', requireAuth(), async (req,res)=>{
		try {
			const { batchId } = req.params; const { userId } = getAuth(req) || {};
			if(!userId) return res.status(401).json({ success:false, message:'Unauthorized' });
			const batch = await Batch.findById(batchId).lean();
			if(!batch) return res.json({ success:true, data:[] });
			const inst = await Institution.findOne({ _id: batch.institutionId, ownerClerkUserId: userId });
			if(!inst) return res.json({ success:true, data:[] });
			if(inst.type !== 'coaching') return res.json({ success:true, data:[] });
			const list = await Student.find({ institutionId: inst._id, batchId: batch._id }).sort({ createdAt:-1 });
			res.json({ success:true, data:list });
		} catch (e){ res.status(500).json({ success:false, message:e.message }); }
	});

	router.post('/batches/:batchId/students', requireAuth(), async (req,res)=>{
		try {
			const { batchId } = req.params; const { userId } = getAuth(req) || {};
			if(!userId) return res.status(401).json({ success:false, message:'Unauthorized' });
			const batch = await Batch.findById(batchId);
			if(!batch) return res.status(404).json({ success:false, message:'batch not found' });
			const inst = await Institution.findOne({ _id: batch.institutionId, ownerClerkUserId: userId });
			if(!inst) return res.status(404).json({ success:false, message:'institution not found' });
			if(inst.type !== 'coaching') return res.status(400).json({ success:false, message:'Only coaching can add students' });
			if (!(await ensureCapacityOrReject(inst, 1, res))) return;
			let data = { ...req.body, institutionId: inst._id, batchId: batch._id };
			if (!data.rollNo) {
				const instCode = await getInstitutionCode(inst);
				const yearYY = String(new Date().getFullYear()).slice(2);
				const letters = (inst.name||'').replace(/[^a-z]/ig,'').slice(0,2).toUpperCase();
				const prefix = `${String(instCode).padStart(4,'0')}${letters}${yearYY}`;
				const key = `student-seq:${inst._id.toString()}:${yearYY}`;
				let cur = await Counter.findOne({ key });
				if (!cur) {
					const top = await Student.findOne({ institutionId: inst._id, rollNo: { $regex: `^${prefix}` } }).sort({ rollNo: -1 }).select('rollNo').lean();
					const current = top?.rollNo ? (parseInt(top.rollNo.slice(-4),10) || 0) : 0;
					cur = await Counter.create({ key, value: current });
				} else {
					const hasAny = await Student.exists({ institutionId: inst._id, rollNo: { $regex: `^${prefix}` } });
					if (!hasAny && cur.value > 0) { cur.value = 0; await cur.save(); }
				}
				const { start } = await nextStudentSeq(inst._id, yearYY, 1);
				data.rollNo = makeRollNo(instCode, inst.name, yearYY, start);
			}
			const item = await Student.create(data);
			res.json({ success:true, data:item });
		} catch (e){ res.status(500).json({ success:false, message:e.message }); }
	});

	// ---- Students under a Course (College) ----
	router.get('/courses/:courseId/students', requireAuth(), async (req,res)=>{
		try {
			const { courseId } = req.params; const { userId } = getAuth(req) || {};
			if(!userId) return res.status(401).json({ success:false, message:'Unauthorized' });
			const course = await Course.findById(courseId).lean();
			if(!course) return res.json({ success:true, data:[] });
			const inst = await Institution.findOne({ _id: course.institutionId, ownerClerkUserId: userId });
			if(!inst) return res.json({ success:true, data:[] });
			if(inst.type !== 'college') return res.json({ success:true, data:[] });
			const list = await Student.find({ institutionId: inst._id, courseId: course._id }).sort({ createdAt:-1 });
			res.json({ success:true, data:list });
		} catch (e){ res.status(500).json({ success:false, message:e.message }); }
	});

	router.post('/courses/:courseId/students', requireAuth(), async (req,res)=>{
		try {
			const { courseId } = req.params; const { userId } = getAuth(req) || {};
			if(!userId) return res.status(401).json({ success:false, message:'Unauthorized' });
			const course = await Course.findById(courseId);
			if(!course) return res.status(404).json({ success:false, message:'course not found' });
			const inst = await Institution.findOne({ _id: course.institutionId, ownerClerkUserId: userId });
			if(!inst) return res.status(404).json({ success:false, message:'institution not found' });
			if(inst.type !== 'college') return res.status(400).json({ success:false, message:'Only colleges can add students' });
			if (!(await ensureCapacityOrReject(inst, 1, res))) return;
			let data = { ...req.body, institutionId: inst._id, courseId: course._id };
			if (!data.rollNo) {
				const instCode = await getInstitutionCode(inst);
				const yearYY = String(new Date().getFullYear()).slice(2);
				const letters = (inst.name||'').replace(/[^a-z]/ig,'').slice(0,2).toUpperCase();
				const prefix = `${String(instCode).padStart(4,'0')}${letters}${yearYY}`;
				const key = `student-seq:${inst._id.toString()}:${yearYY}`;
				let cur = await Counter.findOne({ key });
				if (!cur) {
					const top = await Student.findOne({ institutionId: inst._id, rollNo: { $regex: `^${prefix}` } }).sort({ rollNo: -1 }).select('rollNo').lean();
					const current = top?.rollNo ? (parseInt(top.rollNo.slice(-4),10) || 0) : 0;
					cur = await Counter.create({ key, value: current });
				} else {
					const hasAny = await Student.exists({ institutionId: inst._id, rollNo: { $regex: `^${prefix}` } });
					if (!hasAny && cur.value > 0) { cur.value = 0; await cur.save(); }
				}
				const { start } = await nextStudentSeq(inst._id, yearYY, 1);
				data.rollNo = makeRollNo(instCode, inst.name, yearYY, start);
			}
			const item = await Student.create(data);
			res.json({ success:true, data:item });
		} catch (e){ res.status(500).json({ success:false, message:e.message }); }
	});

		router.post('/classes/:classId/students', requireAuth(), async (req,res)=>{
			try {
				const { classId } = req.params; const { userId } = getAuth(req) || {};
				if(!userId) return res.status(401).json({ success:false, message:'Unauthorized' });
				const cls = await SchoolClass.findById(classId);
				if(!cls) return res.status(404).json({ success:false, message:'class not found' });
				const inst = await Institution.findOne({ _id: cls.institutionId, ownerClerkUserId: userId });
				if(!inst) return res.status(404).json({ success:false, message:'institution not found' });
				if(inst.type !== 'school') return res.status(400).json({ success:false, message:'Only schools can add students' });
					if (!(await ensureCapacityOrReject(inst, 1, res))) return;
					let data = { ...req.body, institutionId: inst._id, classId: cls._id };
					if (!data.rollNo) {
						const instCode = await getInstitutionCode(inst);
						const yearYY = String(new Date().getFullYear()).slice(2);
						const { start } = await nextStudentSeq(inst._id, yearYY, 1);
						data.rollNo = makeRollNo(instCode, inst.name, yearYY, start);
					}
				const item = await Student.create(data);
				res.json({ success:true, data:item });
			} catch (e){ res.status(500).json({ success:false, message:e.message }); }
		});

		// ---- Bulk import students (JSON array) ----
		router.post('/classes/:classId/students/bulk', requireAuth(), async (req,res)=>{
			try {
				const { classId } = req.params; const { userId } = getAuth(req) || {};
				if(!userId) return res.status(401).json({ success:false, message:'Unauthorized' });
				const cls = await SchoolClass.findById(classId);
				if(!cls) return res.status(404).json({ success:false, message:'class not found' });
				const inst = await Institution.findOne({ _id: cls.institutionId, ownerClerkUserId: userId });
				if(!inst) return res.status(404).json({ success:false, message:'institution not found' });
				if(inst.type !== 'school') return res.status(400).json({ success:false, message:'Only schools can add students' });
				const rows = Array.isArray(req.body) ? req.body : (Array.isArray(req.body.rows) ? req.body.rows : []);
				if (!rows.length) return res.status(400).json({ success:false, message:'No rows provided' });
				if (!(await ensureCapacityOrReject(inst, rows.length, res))) return;
				// assign roll numbers alphabetically by name
				const sorted = rows.slice().sort((a,b)=> (a.name||'').localeCompare(b.name||''));
				const instCode = await getInstitutionCode(inst);
				const yearYY = String(new Date().getFullYear()).slice(2);
				const { start } = await nextStudentSeq(inst._id, yearYY, sorted.length);
				const docs = sorted.map((r,i) => ({ ...r, rollNo: makeRollNo(instCode, inst.name, yearYY, start + i), institutionId: inst._id, classId: cls._id }));
				const result = await Student.insertMany(docs, { ordered:false });
				res.json({ success:true, inserted: result.length });
			} catch (e){ res.status(500).json({ success:false, message:e.message }); }
		});

		router.post('/batches/:batchId/students/bulk', requireAuth(), async (req,res)=>{
			try {
				const { batchId } = req.params; const { userId } = getAuth(req) || {};
				if(!userId) return res.status(401).json({ success:false, message:'Unauthorized' });
				const batch = await Batch.findById(batchId);
				if(!batch) return res.status(404).json({ success:false, message:'batch not found' });
				const inst = await Institution.findOne({ _id: batch.institutionId, ownerClerkUserId: userId });
				if(!inst) return res.status(404).json({ success:false, message:'institution not found' });
				if(inst.type !== 'coaching') return res.status(400).json({ success:false, message:'Only coaching can add students' });
				const rows = Array.isArray(req.body) ? req.body : (Array.isArray(req.body.rows) ? req.body.rows : []);
				if (!rows.length) return res.status(400).json({ success:false, message:'No rows provided' });
				if (!(await ensureCapacityOrReject(inst, rows.length, res))) return;
				const sorted = rows.slice().sort((a,b)=> (a.name||'').localeCompare(b.name||''));
				const instCode = await getInstitutionCode(inst);
				const yearYY = String(new Date().getFullYear()).slice(2);
				const { start } = await nextStudentSeq(inst._id, yearYY, sorted.length);
				const docs = sorted.map((r,i) => ({ ...r, rollNo: makeRollNo(instCode, inst.name, yearYY, start + i), institutionId: inst._id, batchId: batch._id }));
				const result = await Student.insertMany(docs, { ordered:false });
				res.json({ success:true, inserted: result.length });
			} catch (e){ res.status(500).json({ success:false, message:e.message }); }
		});

		router.post('/courses/:courseId/students/bulk', requireAuth(), async (req,res)=>{
			try {
				const { courseId } = req.params; const { userId } = getAuth(req) || {};
				if(!userId) return res.status(401).json({ success:false, message:'Unauthorized' });
				const course = await Course.findById(courseId);
				if(!course) return res.status(404).json({ success:false, message:'course not found' });
				const inst = await Institution.findOne({ _id: course.institutionId, ownerClerkUserId: userId });
				if(!inst) return res.status(404).json({ success:false, message:'institution not found' });
				if(inst.type !== 'college') return res.status(400).json({ success:false, message:'Only colleges can add students' });
				const rows = Array.isArray(req.body) ? req.body : (Array.isArray(req.body.rows) ? req.body.rows : []);
				if (!rows.length) return res.status(400).json({ success:false, message:'No rows provided' });
				if (!(await ensureCapacityOrReject(inst, rows.length, res))) return;
				const sorted = rows.slice().sort((a,b)=> (a.name||'').localeCompare(b.name||''));
				const instCode = await getInstitutionCode(inst);
				const yearYY = String(new Date().getFullYear()).slice(2);
				const { start } = await nextStudentSeq(inst._id, yearYY, sorted.length);
				const docs = sorted.map((r,i) => ({ ...r, rollNo: makeRollNo(instCode, inst.name, yearYY, start + i), institutionId: inst._id, courseId: course._id }));
				const result = await Student.insertMany(docs, { ordered:false });
				res.json({ success:true, inserted: result.length });
			} catch (e){ res.status(500).json({ success:false, message:e.message }); }
		});
		router.put('/:id/classes/:classId/students/:studentId', requireAuth(), async (req,res)=>{
			try {
				const { id, classId, studentId } = req.params; const { userId } = getAuth(req) || {};
				if(!userId) return res.status(401).json({ success:false, message:'Unauthorized' });
				const inst = await Institution.findOne({ _id:id, ownerClerkUserId:userId });
				if(!inst) return res.status(404).json({ success:false, message:'institution not found' });
				if(inst.type !== 'school') return res.status(400).json({ success:false, message:'Only schools can update students' });
				const cls = await SchoolClass.findOne({ _id: classId, institutionId: inst._id });
				if(!cls) return res.status(404).json({ success:false, message:'class not found' });
				const update = { ...req.body };
				const item = await Student.findOneAndUpdate({ _id:studentId, institutionId:inst._id, classId:cls._id }, { $set: update }, { new:true });
				if(!item) return res.status(404).json({ success:false, message:'student not found' });
				res.json({ success:true, data:item });
			} catch (e){ res.status(500).json({ success:false, message:e.message }); }
		});

		router.delete('/:id/classes/:classId/students/:studentId', requireAuth(), async (req,res)=>{
			try {
				const { id, classId, studentId } = req.params; const { userId } = getAuth(req) || {};
				if(!userId) return res.status(401).json({ success:false, message:'Unauthorized' });
				const inst = await Institution.findOne({ _id:id, ownerClerkUserId:userId });
				if(!inst) return res.status(404).json({ success:false, message:'institution not found' });
				if(inst.type !== 'school') return res.status(400).json({ success:false, message:'Only schools can delete students' });
				const cls = await SchoolClass.findOne({ _id: classId, institutionId: inst._id });
				if(!cls) return res.status(404).json({ success:false, message:'class not found' });
				const del = await Student.findOneAndDelete({ _id:studentId, institutionId:inst._id, classId:cls._id });
				if(!del) return res.status(404).json({ success:false, message:'student not found' });
				res.json({ success:true });
			} catch (e){ res.status(500).json({ success:false, message:e.message }); }
		});
