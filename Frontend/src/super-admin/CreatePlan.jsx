import { useState, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { serverURL } from '../utils/envExport';

export default function CreatePlanForm() {
  const { getToken } = useAuth();

  const [formData, setFormData] = useState({
    planType: 'coaching',
    tier: 'silver',
    name: '',
    description: '',
    pricingTiers: [
      {
        duration: 1,
        basePrice: '',
        discountedPrice: '',
        currency: 'INR'
      }
    ],
    features: [{ 
      name: '', 
      included: true, 
      description: '', 
      icon: '' 
    }],
    isActive: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ type: '', message: '' });
  const [errors, setErrors] = useState({});

  const descriptionCount = formData.description?.length || 0;

  const durationOptions = [
    { value: 1, label: '1 Month' },
    { value: 3, label: '3 Months' },
    { value: 6, label: '6 Months' },
    { value: 12, label: '1 Year' },
    { value: 24, label: '2 Years' },
    { value: 36, label: '3 Years' }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Plan name is required';
    }

    if (!formData.pricingTiers || formData.pricingTiers.length === 0) {
      newErrors.pricingTiers = 'At least one pricing tier is required';
    } else {
      formData.pricingTiers.forEach((tier, index) => {
        if (!tier.basePrice || isNaN(Number(tier.basePrice)) || Number(tier.basePrice) < 0) {
          newErrors[`pricingTiers.${index}.basePrice`] = 'Valid base price is required';
        }
        
        if (tier.discountedPrice && 
            (isNaN(Number(tier.discountedPrice)) || 
             Number(tier.discountedPrice) < 0 || 
             Number(tier.discountedPrice) > Number(tier.basePrice))) {
          newErrors[`pricingTiers.${index}.discountedPrice`] = 'Invalid discount price';
        }
      });
    }

    const validFeatures = formData.features.filter(f => f.name.trim() !== '');
    if (validFeatures.length === 0) {
      newErrors.features = 'At least one feature is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setToast({ type: '', message: '' });
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const validatedPricingTiers = formData.pricingTiers.map(tier => ({
        duration: tier.duration,
        basePrice: Number(tier.basePrice),
        discountedPrice: tier.discountedPrice ? Number(tier.discountedPrice) : undefined,
        currency: 'INR'
      }));

      const validatedFeatures = formData.features
        .filter(f => f.name.trim() !== '')
        .map(f => ({
          name: f.name.trim(),
          included: !!f.included,
          description: f.description?.trim() || '',
          icon: f.icon?.trim() || ''
        }));

      const requestData = {
        planType: formData.planType,
        tier: formData.tier,
        name: formData.name.trim(),
        description: formData.description.trim(),
        pricingTiers: validatedPricingTiers,
        features: validatedFeatures,
        isActive: formData.isActive
      };

      const token = await getToken();
      await axios.post(`${serverURL}/billing/createPlan`, requestData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setToast({ type: 'success', message: 'Plan created successfully!' });
      resetForm();

    } catch (error) {
      console.error('Error:', error);
      setToast({
        type: 'error',
        message: error.response?.data?.error || error.message || 'Failed to create plan'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      planType: 'coaching',
      tier: 'silver',
      name: '',
      description: '',
      pricingTiers: [{
        duration: 1,
        basePrice: '',
        discountedPrice: '',
        currency: 'INR'
      }],
      features: [{ 
        name: '', 
        included: true, 
        description: '', 
        icon: '' 
      }],
      isActive: true
    });
    setErrors({});
  };

  const handleFeatureChange = (index, field, value) => {
    const updated = [...formData.features];
    updated[index][field] = value;
    setFormData({ ...formData, features: updated });
    
    // Clear feature error when editing
    if (field === 'name' && value.trim() !== '' && errors.features) {
      const newErrors = { ...errors };
      delete newErrors.features;
      setErrors(newErrors);
    }
  };

  const handlePricingTierChange = (index, field, value) => {
    const updated = [...formData.pricingTiers];
    updated[index][field] = value;
    setFormData({ ...formData, pricingTiers: updated });
    
    // Clear pricing tier errors when editing
    if (errors[`pricingTiers.${index}.${field}`]) {
      const newErrors = { ...errors };
      delete newErrors[`pricingTiers.${index}.${field}`];
      setErrors(newErrors);
    }
  };

  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, { name: '', included: true, description: '', icon: '' }]
    });
  };

  const removeFeature = (index) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    });
  };

  const addPricingTier = () => {
    if (formData.pricingTiers.length >= 6) return;
    
    setFormData({
      ...formData,
      pricingTiers: [
        ...formData.pricingTiers,
        {
          duration: 1,
          basePrice: '',
          discountedPrice: '',
          currency: 'INR'
        }
      ]
    });
  };

  const removePricingTier = (index) => {
    if (formData.pricingTiers.length <= 1) return;
    
    setFormData({
      ...formData,
      pricingTiers: formData.pricingTiers.filter((_, i) => i !== index)
    });
  };

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(Number(amount) || 0);
  };

  const calculateSavings = (tier) => {
    const base = Number(tier.basePrice) || 0;
    const disc = Number(tier.discountedPrice) || 0;
    if (!disc || disc >= base) return null;
    const savings = base - disc;
    const percentage = Math.round((savings / base) * 100);
    return {
      amount: savings,
      percentage,
      formatted: `${percentage}% savings (${formatPrice(savings)})`
    };
  };

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-base-content">
            <span className="bg-gradient-to-r from-[#9333EA] via-[#FACC15] to-[#34D399] bg-clip-text text-transparent">
              Create a New Plan
            </span>
          </h1>
          <p className="mt-3 text-base-content/70">
            Configure your pricing, features, and details for your subscription plan
          </p>
        </motion.div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Card */}
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.05, duration: 0.45 }}
            className="card bg-base-100 shadow-xl border border-base-300"
          >
            <div className="card-body">
              <form onSubmit={handleSubmit} className="space-y-6 text-base-content">
                {/* Plan Type (Tabs) */}
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="card-title text-lg">Plan Type</h3>
                  </div>
                  <div role="tablist" className="tabs tabs-boxed w-full mt-2">
                    {['coaching', 'school', 'university'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        role="tab"
                        aria-selected={formData.planType === t}
                        onClick={() => setFormData({ ...formData, planType: t })}
                        className={`tab capitalize ${formData.planType === t ? 'tab-active' : ''}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tier (Tabs) */}
                <div>
                  <h3 className="card-title text-lg">Tier</h3>
                  <div role="tablist" className="tabs tabs-lifted mt-2">
                    {['silver', 'gold', 'platinum'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        role="tab"
                        aria-selected={formData.tier === t}
                        onClick={() => setFormData({ ...formData, tier: t })}
                        className={`tab capitalize ${formData.tier === t ? 'tab-active' : ''}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Plan Name */}
                <div>
                  <label className="label">
                    <span className="label-text text-base-content">Plan Name</span>
                    {errors.name && (
                      <span className="label-text-alt text-error">{errors.name}</span>
                    )}
                  </label>
                  <input
                    type="text"
                    className={`input input-bordered w-full ${errors.name ? 'input-error' : ''}`}
                    placeholder="e.g. Starter, Growth, Pro"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (errors.name) {
                        setErrors(prev => ({ ...prev, name: undefined }));
                      }
                    }}
                    required
                  />
                </div>

                {/* Pricing Tiers */}
                <div>
                  <div className="flex justify-between items-center">
                    <h3 className="card-title text-lg">Pricing</h3>
                    <button
                      type="button"
                      className="btn btn-xs btn-outline"
                      onClick={addPricingTier}
                      disabled={formData.pricingTiers.length >= 6}
                    >
                      + Add Tier
                    </button>
                  </div>
                  
                  {errors.pricingTiers && (
                    <p className="text-error text-sm mb-2">{errors.pricingTiers}</p>
                  )}

                  <div className="space-y-4">
                    {formData.pricingTiers.map((tier, index) => (
                      <div key={index} className="rounded-xl border border-base-300 p-4 relative">
                        {formData.pricingTiers.length > 1 && (
                          <button
                            type="button"
                            className="absolute top-2 right-2 btn btn-xs btn-circle btn-error"
                            onClick={() => removePricingTier(index)}
                          >
                            ✕
                          </button>
                        )}
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="label">
                              <span className="label-text text-base-content">Duration</span>
                            </label>
                            <select
                              className="select select-bordered w-full"
                              value={tier.duration}
                              onChange={(e) => handlePricingTierChange(index, 'duration', parseInt(e.target.value))}
                              required
                            >
                              {durationOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="label">
                              <span className="label-text text-base-content">Base Price (INR)</span>
                              {errors[`pricingTiers.${index}.basePrice`] && (
                                <span className="label-text-alt text-error">
                                  {errors[`pricingTiers.${index}.basePrice`]}
                                </span>
                              )}
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              className={`input input-bordered w-full ${
                                errors[`pricingTiers.${index}.basePrice`] ? 'input-error' : ''
                              }`}
                              value={tier.basePrice}
                              onChange={(e) => handlePricingTierChange(index, 'basePrice', e.target.value)}
                              required
                            />
                          </div>

                          <div>
                            <label className="label">
                              <span className="label-text text-base-content">Discounted Price (INR)</span>
                              {errors[`pricingTiers.${index}.discountedPrice`] && (
                                <span className="label-text-alt text-error">
                                  {errors[`pricingTiers.${index}.discountedPrice`]}
                                </span>
                              )}
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              className={`input input-bordered w-full ${
                                errors[`pricingTiers.${index}.discountedPrice`] ? 'input-error' : ''
                              }`}
                              value={tier.discountedPrice}
                              onChange={(e) => handlePricingTierChange(index, 'discountedPrice', e.target.value)}
                            />
                          </div>
                        </div>

                        {tier.discountedPrice && tier.basePrice &&
                          Number(tier.discountedPrice) > 0 &&
                          Number(tier.discountedPrice) < Number(tier.basePrice) && (
                            <div className="mt-3 text-sm text-success">
                              {calculateSavings(tier).formatted}
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h3 className="card-title text-lg">Features</h3>
                  {errors.features && (
                    <p className="text-error text-sm mb-2">{errors.features}</p>
                  )}
                  
                  <div className="mt-2 space-y-4">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="rounded-xl border border-base-300 p-4 relative">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold text-base-content/90">Feature {index + 1}</h4>
                          <button
                            type="button"
                            className="btn btn-xs btn-error btn-outline"
                            onClick={() => removeFeature(index)}
                            disabled={formData.features.length <= 1}
                          >
                            Remove
                          </button>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="label">
                              <span className="label-text text-base-content">Feature Name</span>
                            </label>
                            <input
                              type="text"
                              className="input input-bordered w-full input-sm"
                              placeholder="e.g. 24/7 Support, Custom Domain"
                              value={feature.name}
                              onChange={(e) => handleFeatureChange(index, 'name', e.target.value)}
                              required
                            />
                          </div>

                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <label className="label cursor-pointer gap-2">
                              <span className="label-text text-base-content">Included</span>
                              <input
                                type="checkbox"
                                className="toggle toggle-primary"
                                checked={feature.included}
                                onChange={(e) => handleFeatureChange(index, 'included', e.target.checked)}
                              />
                            </label>

                            <div className="flex-1 w-full">
                              <label className="label">
                                <span className="label-text text-base-content">Icon (emoji)</span>
                              </label>
                              <input
                                type="text"
                                className="input input-bordered w-full input-sm"
                                placeholder="e.g. 🔥, ⚡, ✨"
                                maxLength={2}
                                value={feature.icon}
                                onChange={(e) => handleFeatureChange(index, 'icon', e.target.value)}
                              />
                            </div>
                          </div>

                          <div>
                            <label className="label">
                              <span className="label-text text-base-content">Description</span>
                            </label>
                            <textarea
                              className="textarea textarea-bordered w-full textarea-sm"
                              placeholder="Short description of this feature"
                              rows={2}
                              value={feature.description}
                              onChange={(e) => handleFeatureChange(index, 'description', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      className="btn btn-outline btn-primary w-full"
                      onClick={addFeature}
                    >
                      + Add Feature
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="card-title text-lg">Description</h3>
                    <span className="text-xs text-base-content/60">{descriptionCount}/300</span>
                  </div>
                  <textarea
                    className="textarea textarea-bordered w-full"
                    placeholder="Short marketing description for this plan..."
                    rows={4}
                    maxLength={300}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                {/* Active toggle */}
                <div className="flex items-center justify-between rounded-xl border border-base-300 bg-base-100 p-4">
                  <div>
                    <p className="font-semibold text-base-content">Plan is active</p>
                    <p className="text-sm text-base-content/70">
                      Toggle off to keep it hidden from users.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="toggle toggle-success"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                  />
                </div>

                {/* Submit */}
                <div className="pt-2">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className={`btn btn-primary w-full ${isSubmitting ? 'loading' : ''}`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating Plan...' : 'Create Plan'}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>

          {/* Live Preview Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="card bg-base-100 shadow-xl border border-base-300"
          >
            <div className="card-body text-base-content">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <div className="badge badge-primary capitalize">{formData.planType}</div>
                <div className="badge badge-secondary capitalize">{formData.tier}</div>
                {formData.isActive ? (
                  <div className="badge badge-success">Active</div>
                ) : (
                  <div className="badge badge-ghost">Hidden</div>
                )}
              </div>

              <h2 className="text-3xl font-bold tracking-tight">
                {formData.name || 'Your Plan Name'}
              </h2>
              <p className="mt-2 text-base-content/70">
                {formData.description || 'A concise pitch for this plan goes here.'}
              </p>

              {/* Pricing Preview */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Pricing</h3>
                <div className="space-y-3">
                  {formData.pricingTiers.map((tier, index) => (
                    <div key={index} className="rounded-xl border border-base-300 p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">
                            {durationOptions.find(d => d.value === tier.duration)?.label || '1 Month'}
                          </p>
                          {tier.discountedPrice && tier.basePrice &&
                            Number(tier.discountedPrice) > 0 &&
                            Number(tier.discountedPrice) < Number(tier.basePrice) && (
                              <p className="text-xs text-success">
                                {calculateSavings(tier).formatted}
                              </p>
                            )}
                        </div>
                        <div className="text-right">
                          {tier.discountedPrice && tier.basePrice &&
                          Number(tier.discountedPrice) > 0 &&
                          Number(tier.discountedPrice) < Number(tier.basePrice) ? (
                            <>
                              <p className="text-sm line-through text-base-content/60">
                                {formatPrice(tier.basePrice)}
                              </p>
                              <p className="text-xl font-bold text-primary">
                                {formatPrice(tier.discountedPrice)}
                              </p>
                            </>
                          ) : (
                            <p className="text-xl font-bold text-primary">
                              {formatPrice(tier.basePrice)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features Preview */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Features</h3>
                <div className="space-y-3">
                  {formData.features.filter(f => f.name.trim() !== '').length === 0 ? (
                    <p className="text-base-content/60 italic">No features added yet.</p>
                  ) : (
                    formData.features
                      .filter(f => f.name.trim() !== '')
                      .map((feature, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-base-200 rounded-lg">
                          {feature.icon && (
                            <span className="text-xl mt-0.5">{feature.icon}</span>
                          )}
                          <div>
                            <p className={`font-medium ${feature.included ? '' : 'line-through text-base-content/50'}`}>
                              {feature.name}
                            </p>
                            {feature.description && (
                              <p className="text-sm text-base-content/70 mt-1">
                                {feature.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                  )}
                </div>

                <div className="mt-6">
                  <button className="btn btn-primary btn-block" type="button" disabled>
                    Get Started
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Toast */}
      <div className="toast toast-end z-50">
        {toast.message && (
          <div className={`alert ${toast.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg`}>
            <span className="text-base-content">
              {toast.message}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}