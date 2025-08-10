import mongoose from 'mongoose';

const ContactSchema = new mongoose.Schema({
  email: String,
  phone: String,
  address: String,
  whatsapp: String,
  mapLink: String
},{ _id:false });

const ThemeSchema = new mongoose.Schema({
  paletteKey: { type: String, required: true },
  colors: {
    primary: String,
    secondary: String,
    accent: String,
    neutral: String,
    base100: String,
    base200: String,
    baseContent: String
  }
},{ _id:false });

const PageSectionSchema = new mongoose.Schema({
  // Expanded enum to match front-end builder section types
  type: { 
    type: String, 
    enum: ['hero','about','courses','login-info','contact','richText','metrics','custom'], 
    default:'custom' 
  },
  data: { type: mongoose.Schema.Types.Mixed }
},{ _id:false });

const PageSchema = new mongoose.Schema({
  key: { type: String },
  title: String,
  sections: [PageSectionSchema]
},{ _id:false });

const InstitutionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  subdomain: { type: String, required: true, unique: true },
  type: { type: String, enum:['school','college','coaching'], required: true },
  logoUrl: String,
  hero: {
    headline: String,
    subheadline: String,
    heroImageUrl: String,
    gallery: [String]
  },
  nav: [{
    label: String,
    url: String,
    position: { type: String, enum: ['left','center','right'], default: 'left' },
    order: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true }
  }],
  tagline: String,
  ownerClerkUserId: { type: String, required: true, index: true },
  sourcePlanId: { type: String, index: true }, // sub-plan (individual plan) that granted builder feature
  contact: ContactSchema,
  theme: ThemeSchema,
  pages: [PageSchema], // keys expected: home, about, courses, student-login, staff-login, contact
  status: { type: String, enum:['draft','published'], default:'draft' },
  publishedAt: Date
  ,publicUrl: String
  ,version: { type: Number, default: 1 }
  // Custom domain support
  ,customDomain: { type: String, unique: true, sparse: true }
  ,customDomainStatus: { type: String, enum:['pending','verifying','active','error'], default: undefined }
  ,customDomainVerificationToken: { type:String }
},{ timestamps:true });

export default mongoose.model('Institution', InstitutionSchema);
