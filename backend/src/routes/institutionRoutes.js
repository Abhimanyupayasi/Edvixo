import express from 'express';
import { requireAuth, getAuth } from '@clerk/express';
import { createOrUpdateDraft, publishInstitution, getInstitutionBySubdomain, getMyInstitution, updateInstitution, requestCustomDomain, verifyCustomDomain } from '../controllers/institutionController.js';
import Institution from '../models/Institution.js';

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
				list = await Institution.find(filter).select('name slug status publicUrl sourcePlanId').lean();
			}
		// Fallback: if planId provided but none linked yet, try to auto-link oldest orphan institution
		if (planId && list.length === 0) {
			const orphan = await Institution.findOne({ ownerClerkUserId:userId, $or:[{ sourcePlanId: { $exists:false } }, { sourcePlanId: null }, { sourcePlanId: '' }] }).sort({ createdAt:1 });
			if (orphan) {
				console.log('[institutions/mine] backfilling sourcePlanId on orphan', orphan._id.toString(), '->', planId);
				orphan.sourcePlanId = planId;
				await orphan.save();
				list = await Institution.find({ ownerClerkUserId:userId, sourcePlanId:planId }).select('name slug status publicUrl sourcePlanId').lean();
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
