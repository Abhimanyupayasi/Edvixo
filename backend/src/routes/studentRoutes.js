import express from 'express';
import multer from 'multer';
import { requireAuth, getAuth } from '@clerk/express';
import Institution from '../models/Institution.js';
import Student from '../models/Student.js';
import SchoolClass from '../models/SchoolClass.js';
import Batch from '../models/Batch.js';
import Course from '../models/Course.js';
import { parse as csvParse } from 'csv-parse';
import xlsx from 'xlsx';
import Counter from '../models/Counter.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// Helper to detect type and parent scope by id
async function resolveScope(scopeType, scopeId, userId){
	if(scopeType==='class'){
		const cls = await SchoolClass.findById(scopeId).lean();
		if(!cls) return null;
		const inst = await Institution.findOne({ _id: cls.institutionId, ownerClerkUserId:userId });
		if(!inst) return null; return { inst, cls };
	}
	if(scopeType==='batch'){
		const batch = await Batch.findById(scopeId).lean();
		if(!batch) return null;
		const inst = await Institution.findOne({ _id: batch.institutionId, ownerClerkUserId:userId });
		if(!inst) return null; return { inst, batch };
	}
	if(scopeType==='course'){
		const course = await Course.findById(scopeId).lean();
		if(!course) return null;
		const inst = await Institution.findOne({ _id: course.institutionId, ownerClerkUserId:userId });
		if(!inst) return null; return { inst, course };
	}
	return null;
}

// ---- Roll number helpers ----
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

// ---- Date normalization helpers ----
function pad2(n){ return String(n).padStart(2,'0'); }
function isExcelSerial(n){ return typeof n==='number' && n>20000 && n<60000; }
function parseExcelSerialToISO(n){
	// Prefer xlsx SSF if available
	try {
		const d = xlsx.SSF && xlsx.SSF.parse_date_code ? xlsx.SSF.parse_date_code(n) : null;
		if (d && d.y && d.m && d.d) return `${d.y}-${pad2(d.m)}-${pad2(d.d)}`;
	} catch {}
	// Fallback: 1900 date system offset 25569 days
	const ms = (n - 25569) * 86400 * 1000;
	const dt = new Date(ms);
	if (!isNaN(dt.getTime())) return `${dt.getFullYear()}-${pad2(dt.getMonth()+1)}-${pad2(dt.getDate())}`;
	return '';
}
function normalizeDateToISO(val){
	if (val===null || val===undefined) return '';
	if (typeof val === 'number') {
		if (isExcelSerial(val)) return parseExcelSerialToISO(val);
		// unix ms?
		const d = new Date(val);
		if (!isNaN(d.getTime())) return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
		return '';
	}
		if (typeof val === 'string') {
			const s = val.trim();
		if (!s) return '';
		if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
		if (/^\d{5}$/.test(s)) return parseExcelSerialToISO(Number(s));
			// dd-mm-yyyy or dd/mm/yyyy (assume day-first, common in India)
			if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/.test(s)){
				const parts = s.split(/[\/\-]/).map(x=>parseInt(x,10));
				let d = parts[0], m = parts[1];
				let y = parts[2] < 100 ? 2000 + parts[2] : parts[2];
				// if unambiguous (values > 12) keep them; else still assume day-first
				if (parts[0] > 31 && parts[1] <= 12) { m = parts[0]; d = parts[1]; }
				const dt = new Date(y, m-1, d);
				if (!isNaN(dt.getTime())) return `${dt.getFullYear()}-${pad2(dt.getMonth()+1)}-${pad2(dt.getDate())}`;
			}
		const d2 = new Date(s);
		if (!isNaN(d2.getTime())) return `${d2.getFullYear()}-${pad2(d2.getMonth()+1)}-${pad2(d2.getDate())}`;
		return '';
	}
	return '';
}

// Upload a CSV/XLSX to preview rows before confirm-save
router.post('/upload/:scopeType/:scopeId', requireAuth(), upload.single('file'), async (req,res)=>{
	try{
		const { userId } = getAuth(req) || {}; if(!userId) return res.status(401).json({ success:false, message:'Unauthorized' });
		const { scopeType, scopeId } = req.params; // class | batch | course
		const ctx = await resolveScope(scopeType, scopeId, userId);
		if(!ctx) return res.status(404).json({ success:false, message:'Scope not found' });
		if(!req.file) return res.status(400).json({ success:false, message:'File required' });
		const mime = req.file.mimetype;
		const buf = req.file.buffer;
		let rows = [];
		if (mime.includes('csv') || /text\/(plain|csv)/.test(mime)){
			await new Promise((resolve,reject)=>{
				csvParse(buf.toString('utf8'), { columns:true, skip_empty_lines:true, trim:true }, (err, recs)=>{
					if(err) return reject(err); rows = recs; resolve();
				});
			});
		} else {
			// try xlsx
			const wb = xlsx.read(buf, { type:'buffer' });
			const sheet = wb.SheetNames[0];
			rows = xlsx.utils.sheet_to_json(wb.Sheets[sheet] || {}, { defval:'' });
		}
		// Normalize keys to expected payload fields
		let normalized = rows.map(r=>{
			const rawDob = r.dob ?? r.DOB ?? r.birth ?? '';
			const dobISO = normalizeDateToISO(rawDob);
			return {
			name: r.name || r.Name || `${r.first_name||''} ${r.last_name||''}`.trim(),
			rollNo: r.rollNo || r.RollNo || r.roll || r.enrollment_no || '',
			admissionNo: r.admissionNo || r.AdmissionNo || r['admission No'] || r['Admission No'] || r.admission || '',
			gender: (r.gender||'').toString().toLowerCase(),
			dob: dobISO,
			email: r.email || r.Email || '',
			phone: r.phone || r.Phone || r.mobile || '',
			address: r.address || '',
			city: r.city || '', state: r.state || '', pincode: r.pincode || r.pin || '',
			parent: {
				fatherName: r.fatherName || r.father || '',
				motherName: r.motherName || r.mother || '',
				guardianName: r.guardianName || r.guardian || '',
				fatherPhone: r.fatherPhone || '', motherPhone: r.motherPhone || '', guardianPhone: r.guardianPhone || '',
				email: r.parentEmail || ''
			},
			fee: { total: Number(r.feeTotal||r.fee||0)||0, paid: Number(r.feePaid||0)||0, currency:'INR' },
			status: (r.status||'active').toString().toLowerCase()==='inactive'?'inactive':'active'
		};
		}).filter(x=>x.name);

		// Sort by name for deterministic roll assignment
		normalized.sort((a,b)=> (a.name||'').localeCompare(b.name||''));
			// Generate preview roll numbers without reserving (sync with DB first)
			const instCode = await getInstitutionCode(ctx.inst);
			const yearYY = String(new Date().getFullYear()).slice(2);
			const letters = (ctx.inst.name||'').replace(/[^a-z]/ig,'').slice(0,2).toUpperCase();
			const prefix = `${String(instCode).padStart(4,'0')}${letters}${yearYY}`;
			const key = `student-seq:${ctx.inst._id.toString()}:${yearYY}`;
			let cur = await Counter.findOne({ key });
			if (!cur) {
				const top = await Student.findOne({ institutionId: ctx.inst._id, rollNo: { $regex: `^${prefix}` } }).sort({ rollNo: -1 }).select('rollNo').lean();
				const current = top?.rollNo ? (parseInt(top.rollNo.slice(-4),10) || 0) : 0;
				cur = await Counter.create({ key, value: current });
			} else {
				const hasAny = await Student.exists({ institutionId: ctx.inst._id, rollNo: { $regex: `^${prefix}` } });
				if (!hasAny && cur.value > 0) { cur.value = 0; await cur.save(); }
			}
			let seq = (cur.value || 0) + 1;
		const preview = normalized.slice(0,200).map(r=>({
			...r,
			rollNo: makeRollNo(instCode, ctx.inst.name, yearYY, seq++)
		}));

		res.json({ success:true, data:{ preview, total: normalized.length } });
	}catch(e){
		console.error('upload preview error', e); res.status(500).json({ success:false, message:e.message });
	}
});

// Confirm-save preview rows (client will send edited rows)
router.post('/confirm/:scopeType/:scopeId', requireAuth(), async (req,res)=>{
	try{
		const { userId } = getAuth(req) || {}; if(!userId) return res.status(401).json({ success:false, message:'Unauthorized' });
		const { scopeType, scopeId } = req.params;
		const rows = Array.isArray(req.body) ? req.body : (Array.isArray(req.body.rows) ? req.body.rows : []);
		if(!rows.length) return res.status(400).json({ success:false, message:'No rows provided' });
		const ctx = await resolveScope(scopeType, scopeId, userId);
		if(!ctx) return res.status(404).json({ success:false, message:'Scope not found' });
		const inst = ctx.inst;
		// sort rows by name to assign roll numbers alphabetically
		const sorted = rows.slice().sort((a,b)=> (a.name||'').localeCompare(b.name||''));
		const instCode = await getInstitutionCode(inst);
		const yearYY = String(new Date().getFullYear()).slice(2);
		// Sync counter with DB before reserving
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
		const { start } = await nextStudentSeq(inst._id, yearYY, sorted.length);
		const docs = sorted.map((r,i)=>{
			const dobISO = normalizeDateToISO(r.dob || '');
			return {
				...r,
				dob: dobISO || undefined,
				rollNo: makeRollNo(instCode, inst.name, yearYY, start + i),
				institutionId: inst._id,
				classId: ctx.cls?._id,
				batchId: ctx.batch?._id,
				courseId: ctx.course?._id
			};
		});
		const result = await Student.insertMany(docs, { ordered:false });
		res.json({ success:true, inserted: result.length });
	}catch(e){ console.error('confirm import error', e); res.status(500).json({ success:false, message:e.message }); }
});

// List all students for a given planId (owned by current user)
router.get('/by-plan/:planId', requireAuth(), async (req,res)=>{
	try{
		const { userId } = getAuth(req) || {}; if(!userId) return res.status(401).json({ success:false, message:'Unauthorized' });
		const { planId } = req.params;
		const page = Math.max(1, parseInt(req.query.page)||1);
		const limit = Math.min(200, Math.max(1, parseInt(req.query.limit)||50));
		const q = (req.query.q||'').toString().trim();
		// Institutions under this plan and user
		const insts = await Institution.find({ ownerClerkUserId:userId, sourcePlanId: planId }).select('_id name type').lean();
		if (!insts.length) return res.json({ success:true, data:{ items:[], page, limit, total:0 } });
		const instIds = insts.map(i=>i._id);
		const instMap = new Map(insts.map(i=>[i._id.toString(), i]));
		// Optional search
		const filter = { institutionId: { $in: instIds } };
		if (q) {
			const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
			filter.$or = [
				{ name: rx }, { email: rx }, { phone: rx }, { admissionNo: rx }, { rollNo: rx }
			];
		}
		const total = await Student.countDocuments(filter);
		const items = await Student.find(filter)
			.sort({ createdAt:-1 })
			.skip((page-1)*limit)
			.limit(limit)
			.lean();
		// Load scope names in batch
		const classIds = items.filter(s=>s.classId).map(s=>s.classId);
		const batchIds = items.filter(s=>s.batchId).map(s=>s.batchId);
		const courseIds = items.filter(s=>s.courseId).map(s=>s.courseId);
		const [classes, batches, courses] = await Promise.all([
			classIds.length ? SchoolClass.find({ _id: { $in: classIds } }).select('_id name section').lean() : [],
			batchIds.length ? Batch.find({ _id: { $in: batchIds } }).select('_id name timing').lean() : [],
			courseIds.length ? Course.find({ _id: { $in: courseIds } }).select('_id name durationMonths').lean() : []
		]);
		const classMap = new Map(classes.map(c=>[c._id.toString(), c]));
		const batchMap = new Map(batches.map(b=>[b._id.toString(), b]));
		const courseMap = new Map(courses.map(c=>[c._id.toString(), c]));
		const enriched = items.map(s => {
			const inst = instMap.get(s.institutionId?.toString());
			let scopeType = null, scopeName = null, scopeExtra=null;
			if (s.classId) { scopeType='class'; const c = classMap.get(s.classId.toString()); if (c) { scopeName = c.name; scopeExtra = c.section; } }
			else if (s.batchId) { scopeType='batch'; const b = batchMap.get(s.batchId.toString()); if (b) { scopeName = b.name; scopeExtra = b.timing; } }
			else if (s.courseId) { scopeType='course'; const c = courseMap.get(s.courseId.toString()); if (c) { scopeName = c.name; scopeExtra = c.durationMonths; } }
			return {
				_id: s._id,
				name: s.name,
				rollNo: s.rollNo,
				admissionNo: s.admissionNo,
				gender: s.gender,
				dob: s.dob,
				email: s.email,
				phone: s.phone,
				address: s.address,
				city: s.city,
				state: s.state,
				pincode: s.pincode,
				parent: s.parent || {},
				fee: s.fee || {},
				status: s.status,
				admissionDate: s.admissionDate,
				institution: inst ? { id: inst._id, name: inst.name, type: inst.type } : null,
				scope: { type: scopeType, name: scopeName, extra: scopeExtra }
			};
		});
		res.json({ success:true, data:{ items: enriched, page, limit, total } });
	}catch(e){ console.error('by-plan students error', e); res.status(500).json({ success:false, message:e.message }); }
});

// Update a student by id (owner-scoped, works for any type)
router.patch('/:studentId', requireAuth(), async (req,res)=>{
	try{
		const { userId } = getAuth(req) || {}; if(!userId) return res.status(401).json({ success:false, message:'Unauthorized' });
		const { studentId } = req.params;
		const stu = await Student.findById(studentId).lean();
		if (!stu) return res.status(404).json({ success:false, message:'Student not found' });
		const inst = await Institution.findOne({ _id: stu.institutionId, ownerClerkUserId: userId }).select('_id').lean();
		if (!inst) return res.status(403).json({ success:false, message:'Forbidden' });

		// Whitelist fields
		const allow = ['name','rollNo','admissionNo','gender','dob','email','phone','address','city','state','pincode','status','admissionDate'];
		const update = {};
		for (const k of allow) if (k in req.body) update[k] = req.body[k];
		// Parent nested
		if (req.body.parent && typeof req.body.parent === 'object') {
			const p = req.body.parent;
			update['parent.fatherName'] = p.fatherName;
			update['parent.motherName'] = p.motherName;
			update['parent.guardianName'] = p.guardianName;
			update['parent.fatherPhone'] = p.fatherPhone;
			update['parent.motherPhone'] = p.motherPhone;
			update['parent.guardianPhone'] = p.guardianPhone;
			update['parent.email'] = p.email;
		}
		// Fee nested
		if (req.body.fee && typeof req.body.fee === 'object') {
			const f = req.body.fee;
			if ('total' in f) update['fee.total'] = Number(f.total) || 0;
			if ('paid' in f) update['fee.paid'] = Number(f.paid) || 0;
			if ('currency' in f) update['fee.currency'] = f.currency;
		}

		// Clean undefined keys
		Object.keys(update).forEach(k => update[k] === undefined && delete update[k]);

		const updated = await Student.findOneAndUpdate({ _id: studentId, institutionId: inst._id }, { $set: update }, { new:true });
		if (!updated) return res.status(404).json({ success:false, message:'Student not found or not allowed' });
		res.json({ success:true, data:updated });
	}catch(e){ console.error('student patch error', e); res.status(500).json({ success:false, message:e.message }); }
});

// Fetch a single student (owner-scoped)
router.get('/:studentId', requireAuth(), async (req,res)=>{
	try{
		const { userId } = getAuth(req) || {}; if(!userId) return res.status(401).json({ success:false, message:'Unauthorized' });
		const { studentId } = req.params;
		const stu = await Student.findById(studentId).lean();
		if (!stu) return res.status(404).json({ success:false, message:'Student not found' });
		const inst = await Institution.findOne({ _id: stu.institutionId, ownerClerkUserId: userId }).select('_id').lean();
		if (!inst) return res.status(403).json({ success:false, message:'Forbidden' });
		res.json({ success:true, data:stu });
	}catch(e){ console.error('student get error', e); res.status(500).json({ success:false, message:e.message }); }
});

export default router;
