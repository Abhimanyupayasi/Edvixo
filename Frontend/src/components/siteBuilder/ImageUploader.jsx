import React, { useState } from 'react';

// Simple unsigned Cloudinary uploader.
// Requires VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UNSIGNED_PRESET env vars.
export default function ImageUploader({ label = 'Upload Image', value, onChange, folder='institutions', aspectHint }) {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const unsignedPreset = import.meta.env.VITE_CLOUDINARY_UNSIGNED_PRESET; // if missing will error
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if(!file) return;
    if(!cloudName || !unsignedPreset){
      setError('Cloudinary env vars missing');
      return;
    }
    setError(null); setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('upload_preset', unsignedPreset);
      form.append('folder', folder);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method:'POST', body: form });
      const json = await res.json();
      if(!res.ok){ throw new Error(json.error?.message || 'Upload failed'); }
      onChange && onChange(json.secure_url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-1">
      {label && <div className="text-xs font-medium flex items-center gap-2">{label}{aspectHint && <span className="opacity-50">({aspectHint})</span>}</div>}
      {value && (
        <div className="relative inline-block">
          <img src={value} alt={label} className="rounded border max-h-40 object-contain bg-base-200 p-2" />
          <button type="button" className="btn btn-xs btn-outline absolute top-1 right-1" onClick={()=>onChange('')}>Remove</button>
        </div>
      )}
      <input type="file" accept="image/*" onChange={handleFile} className="file-input file-input-bordered file-input-sm w-full max-w-xs" disabled={uploading} />
      {uploading && <div className="text-xs opacity-70">Uploading...</div>}
      {error && <div className="text-error text-xs">{error}</div>}
      {!value && !uploading && <div className="text-[10px] opacity-50">PNG/JPG/WebP up to ~2MB.</div>}
    </div>
  );
}
