import Institution from '../models/Institution.js';
import slugify from 'slugify';
import { getAuth } from '@clerk/express';
import mongoose from 'mongoose';
import crypto from 'crypto';

// Default scaffold for pages
const DEFAULT_PAGES = [
  { key: 'home', title: 'Home', sections: [{ type: 'hero', data: { headline: 'Welcome to Our Institution', subheadline: 'Excellence in Education' } }] },
  { key: 'about', title: 'About Us', sections: [{ type: 'about', data: { content: 'Describe your mission, vision and achievements here.' } }] },
  { key: 'courses', title: 'Courses', sections: [{ type: 'courses', data: { items: [] } }] },
  { key: 'student-login', title: 'Student Login', sections: [{ type: 'login-info', data: { instructions: 'Student portal coming soon.' } }] },
  { key: 'staff-login', title: 'Admin / Staff Login', sections: [{ type: 'login-info', data: { instructions: 'Staff portal coming soon.' } }] },
  { key: 'contact', title: 'Contact Us', sections: [{ type: 'contact', data: { address: '', phone: '', email: '' } }] }
];

export const createOrUpdateDraft = async (req, res) => {
  try {
  const { userId } = getAuth(req) || {};
  if(!userId) return res.status(401).json({ success:false, message:'Unauthorized' });
  let { id, name, type, paletteKey, colors, contact, tagline, sourcePlanId, pages, logoUrl, hero, nav } = req.body;
  // Allow plan id to be supplied via header x-plan-id as fallback
  if(!sourcePlanId && req.headers['x-plan-id']) sourcePlanId = req.headers['x-plan-id'];
    if (!name || !type || !paletteKey) return res.status(400).json({ success:false, message:'name, type, paletteKey required' });
  console.log('[createOrUpdateDraft] user', userId, 'id', id, 'plan', sourcePlanId);

    // find existing by explicit id OR enforce one-per-plan (sourcePlanId) uniqueness
    let inst = null;
    if (id) {
      inst = await Institution.findOne({ _id: id, ownerClerkUserId: userId });
      if (!inst) {
        if (sourcePlanId) {
          console.log('[createOrUpdateDraft] provided id not found; falling back to sourcePlanId create path');
          id = null; // treat as new
        } else {
          return res.status(404).json({ success:false, message:'not found' });
        }
      }
    }
    if (!inst && sourcePlanId) {
      inst = await Institution.findOne({ ownerClerkUserId: userId, sourcePlanId });
    }

    // If already published for this plan and user attempted creation (no id) block extra draft creation
    if (!id && inst && inst.status === 'published') {
      // Update allowed editable fields (including non-structural page content) then return
      inst.name = name; // allow rename
      inst.tagline = tagline;
      inst.theme = { paletteKey, colors: colors || {} };
      inst.contact = contact;
      if (logoUrl) inst.logoUrl = logoUrl;
      if (hero) inst.hero = { ...inst.hero?.toObject?.(), ...hero };
      if (nav) inst.nav = nav;
      // Merge page section data if payload provided without structural changes
      if (pages && Array.isArray(pages)) {
        for (const incoming of pages) {
          const existing = inst.pages.find(p => p.key === incoming.key);
          if (!existing) continue; // ignore new pages
            // Update title if provided (non-structural)
            if (incoming.title) existing.title = incoming.title;
            if (Array.isArray(incoming.sections)) {
              // Only update matching index & type
              incoming.sections.forEach((incSec, idx) => {
                if (!existing.sections[idx]) return; // ignore extra sections
                if (existing.sections[idx].type !== incSec.type) return; // prevent type mutation
                // Replace data object only
                if (incSec.data && typeof incSec.data === 'object') {
                  existing.sections[idx].data = incSec.data;
                }
              });
            }
        }
      }
      await inst.save();
      if (sourcePlanId) {
        await Institution.deleteMany({ ownerClerkUserId: userId, sourcePlanId, status:'draft' });
      }
  inst.version = (inst.version || 1) + 1;
  await inst.save();
      return res.json({ success:true, data: inst });
    }

    const desiredSlug = slugify(name, { lower:true, strict:true });
    const subdomain = desiredSlug;

  if (!inst) {
      // ensure uniqueness
      let slug = desiredSlug; let c=1;
      while (await Institution.findOne({ slug })) slug = `${desiredSlug}-${c++}`;
      inst = await Institution.create({
        name, type, slug, subdomain: slug, ownerClerkUserId: userId,
        tagline,
        theme: { paletteKey, colors: colors || {} },
        contact,
  sourcePlanId,
        logoUrl,
        hero,
        nav: nav && nav.length ? nav : [
          { label: 'Home', url: '#home', position: 'center', order: 0 },
          { label: 'About Us', url: '#about', position: 'center', order: 1 },
          { label: 'Courses', url: '#courses', position: 'center', order: 2 },
          { label: 'Student Login', url: '#student-login', position: 'center', order: 3 },
          { label: 'Admin Login', url: '#staff-login', position: 'right', order: 0 },
          { label: 'Contact', url: '#contact', position: 'right', order: 1 }
        ],
  pages: pages && pages.length ? pages : DEFAULT_PAGES,
  publicUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/public-site?site=${slug}`
      });
      // After creating a draft make sure no duplicate drafts exist (retaining only newest one)
      if (sourcePlanId) {
        await Institution.deleteMany({ ownerClerkUserId:userId, sourcePlanId, status:'draft', _id: { $ne: inst._id } });
      }
      return res.json({ success:true, data:inst });
    }

    // if published restrict modifications to allowed fields only
  const published = inst.status === 'published';
    inst.name = name;
    inst.type = type;
    inst.tagline = tagline;
    inst.theme = { paletteKey, colors: colors || {} };
    inst.contact = contact;
    if (!published) {
      if (pages) inst.pages = pages; // full replace before publish
    } else {
      // Merge non-structural page content updates (title & section data) if keys/types match
      if (pages && Array.isArray(pages)) {
        for (const incoming of pages) {
          const existing = inst.pages.find(p => p.key === incoming.key);
          if (!existing) continue; // ignore new pages
          if (incoming.title) existing.title = incoming.title;
          if (Array.isArray(incoming.sections)) {
            incoming.sections.forEach((incSec, idx) => {
              if (!existing.sections[idx]) return;
              if (existing.sections[idx].type !== incSec.type) return; // prevent structural change
              if (incSec.data && typeof incSec.data === 'object') {
                existing.sections[idx].data = incSec.data;
              }
            });
          }
        }
      }
    }
    if (sourcePlanId) inst.sourcePlanId = sourcePlanId;
    if (logoUrl) inst.logoUrl = logoUrl;
    if (hero) inst.hero = { ...inst.hero?.toObject?.(), ...hero };
    if (nav) inst.nav = nav; // allow updating nav after publish

    await inst.save();
  inst.version = (inst.version || 1) + 1;
  await inst.save();
    res.json({ success:true, data:inst });
  } catch (e) {
    console.error('createOrUpdateDraft error:', e); // log full error
    res.status(500).json({ success:false, message:e.message });
  }
};

export const publishInstitution = async (req, res) => {
  try {
  const { userId } = getAuth(req) || {};
  if(!userId) return res.status(401).json({ success:false, message:'Unauthorized' });
    const { id } = req.params;
    const inst = await Institution.findOne({ _id:id, ownerClerkUserId:userId });
    if (!inst) return res.status(404).json({ success:false, message:'Not found' });
    inst.status = 'published';
    if(!inst.publicUrl){
      inst.publicUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/public-site?site=${inst.slug}`;
    }
  inst.publishedAt = new Date();
  inst.version = (inst.version || 1) + 1;
  await inst.save();
    // Delete any other draft institutions for this plan/user to enforce single published site
    if (inst.sourcePlanId) {
      await Institution.deleteMany({ ownerClerkUserId:userId, sourcePlanId:inst.sourcePlanId, _id: { $ne: inst._id } });
    }
    res.json({ success:true, data:inst });
  } catch (e) {
    console.error('publishInstitution error:', e);
    res.status(500).json({ success:false, message:e.message });
  }
};

// Explicit update endpoint (works for draft or published, enforces single-site rules, merges non-structural page data)
export const updateInstitution = async (req, res) => {
  try {
    const { userId } = getAuth(req) || {};
    if(!userId) return res.status(401).json({ success:false, message:'Unauthorized' });
    const { id } = req.params;
    const { name, tagline, paletteKey, colors, contact, logoUrl, hero, nav, pages, type } = req.body;
    console.log('[updateInstitution] user', userId, 'id', id);
    let inst = await Institution.findOne({ _id:id, ownerClerkUserId:userId });
    if(!inst) {
      // Distinguish between not owned and not existing for clearer debugging (both still hidden to user generally)
      const exists = await Institution.findById(id).select('_id ownerClerkUserId').lean();
      if (exists) {
        console.log('[updateInstitution] doc exists but owned by', exists.ownerClerkUserId, 'not', userId);
        return res.status(403).json({ success:false, message:'Forbidden' });
      }
      console.log('[updateInstitution] doc not found');
      return res.status(404).json({ success:false, message:'Not found' });
    }
    // Ensure version field present
    if (typeof inst.version !== 'number') inst.version = 1;
    if (name) inst.name = name;
    if (tagline !== undefined) inst.tagline = tagline;
    if (type) inst.type = type; // optional change
    if (paletteKey) inst.theme = { paletteKey, colors: colors || {} };
    if (contact) inst.contact = contact;
    if (logoUrl) inst.logoUrl = logoUrl;
    if (hero) inst.hero = { ...inst.hero?.toObject?.(), ...hero };
    if (nav) inst.nav = nav;
    // Merge non-structural page updates
    if (pages && Array.isArray(pages)) {
      for (const incoming of pages) {
        const existing = inst.pages.find(p => p.key === incoming.key);
        if (!existing) continue; // ignore new pages
        if (incoming.title) existing.title = incoming.title;
        if (Array.isArray(incoming.sections)) {
          incoming.sections.forEach((incSec, idx) => {
            if (!existing.sections[idx]) return;
            if (existing.sections[idx].type !== incSec.type) return;
            if (incSec.data && typeof incSec.data === 'object') {
              existing.sections[idx].data = incSec.data;
            }
          });
        }
      }
    }
    await inst.save();
  inst.version = (inst.version || 1) + 1;
  await inst.save();
    res.json({ success:true, data:inst });
  } catch (e) {
    console.error('updateInstitution error:', e);
    res.status(500).json({ success:false, message:e.message });
  }
};

export const getInstitutionBySubdomain = async (req, res) => {
  try {
  const { subdomain } = req.params;
    const inst = await Institution.findOne({ subdomain, status:'published' });
    if (!inst) return res.status(404).json({ success:false, message:'Not found' });
    res.json({ success:true, data:inst });
  } catch (e) {
  console.error('getInstitutionBySubdomain error:', e);
  res.status(500).json({ success:false, message:e.message });
  }
};

// Get full institution (draft or published) owned by current user by id
export const getMyInstitution = async (req, res) => {
  try {
    const { userId } = getAuth(req) || {};
    if(!userId) return res.status(401).json({ success:false, message:'Unauthorized' });
    const { id } = req.params;
    if(id === 'mine') {
      // route conflict fallback safeguard
      return res.status(400).json({ success:false, message:'Use /institutions/mine for listing, not /institutions/mine as id.' });
    }
  if(!mongoose.isValidObjectId(id)) return res.status(400).json({ success:false, message:'Invalid id'});
    const inst = await Institution.findOne({ _id: id, ownerClerkUserId: userId });
    if(!inst) return res.status(404).json({ success:false, message:'Not found' });
    res.json({ success:true, data: inst });
  } catch(e){
    console.error('getMyInstitution error:', e);
    res.status(500).json({ success:false, message:e.message });
  }
};

// Request or update a custom domain for an institution (owner only)
export const requestCustomDomain = async (req,res) => {
  try {
    const { userId } = getAuth(req) || {};
    if(!userId) return res.status(401).json({ success:false, message:'Unauthorized' });
    const { id } = req.params; // institution id
    const { domain } = req.body;
    if(!domain) return res.status(400).json({ success:false, message:'domain required' });
    const inst = await Institution.findOne({ _id:id, ownerClerkUserId:userId });
    if(!inst) return res.status(404).json({ success:false, message:'Not found' });
    // basic normalization
    const norm = domain.trim().toLowerCase().replace(/^https?:\/\//,'').replace(/\/$/,'');
    // prevent claiming your platform root domain
    const platformRoot = (process.env.PLATFORM_ROOT_DOMAIN||'').toLowerCase();
    if(platformRoot && (norm===platformRoot || norm.endsWith('.'+platformRoot))) {
      return res.status(400).json({ success:false, message:'Use subdomain builder for platform root' });
    }
    // generate token if new or domain changed
    if(inst.customDomain !== norm) {
      inst.customDomain = norm;
      inst.customDomainStatus = 'pending';
      inst.customDomainVerificationToken = crypto.randomBytes(12).toString('hex');
    } else if(!inst.customDomainVerificationToken) {
      inst.customDomainVerificationToken = crypto.randomBytes(12).toString('hex');
      inst.customDomainStatus = 'pending';
    }
    await inst.save();
    res.json({ success:true, data:{ customDomain: inst.customDomain, status: inst.customDomainStatus, token: inst.customDomainVerificationToken } });
  } catch(e){
    console.error('requestCustomDomain error:', e);
    res.status(500).json({ success:false, message:e.message });
  }
};

// Verify DNS records (TXT + CNAME optionally). Actual DNS resolution should be implemented; placeholder here.
export const verifyCustomDomain = async (req,res) => {
  try {
    const { userId } = getAuth(req) || {};
    if(!userId) return res.status(401).json({ success:false, message:'Unauthorized' });
    const { id } = req.params;
    const inst = await Institution.findOne({ _id:id, ownerClerkUserId:userId });
    if(!inst) return res.status(404).json({ success:false, message:'Not found' });
    if(!inst.customDomain) return res.status(400).json({ success:false, message:'No custom domain set' });
    // Placeholder: mark verifying then immediately active (replace with real DNS checks)
    inst.customDomainStatus = 'active';
    await inst.save();
    res.json({ success:true, data:{ customDomain: inst.customDomain, status: inst.customDomainStatus } });
  } catch(e){
    console.error('verifyCustomDomain error:', e);
    res.status(500).json({ success:false, message:e.message });
  }
};
