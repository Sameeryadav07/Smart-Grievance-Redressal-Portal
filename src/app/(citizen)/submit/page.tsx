'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { complaintSubmitSchema, ComplaintSubmitInput } from '@/schemas/complaint';
import ImageUpload from '@/components/forms/ImageUpload';
import MapPicker from '@/components/forms/MapPicker';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface CategoryOption {
  id: number;
  name: string;
  departmentId: number;
}

export default function SubmitComplaintPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<ComplaintSubmitInput>({
    title: '',
    description: '',
    categoryId: undefined,
    locationLat: 28.6139,
    locationLng: 77.209,
    locationAddress: '',
  });

  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTrackingId, setSubmittedTrackingId] = useState<string | null>(null);

  // Fetch categories on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await axios.get('/api/departments');
        if (res.data?.categories) {
          setCategories(res.data.categories);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    }
    loadCategories();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'categoryId' ? (value ? parseInt(value, 10) : undefined) : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleLocationSelect = useCallback((lat: number, lng: number, address: string) => {
    setFormData((prev) => ({
      ...prev,
      locationLat: lat,
      locationLng: lng,
      locationAddress: address,
    }));
  }, []);

  const handleImageSelect = useCallback((base64: string | null) => {
    setImageBase64(base64);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validated = complaintSubmitSchema.safeParse(formData);
    if (!validated.success) {
      const fieldErrors: Record<string, string> = {};
      validated.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      toast.error('Please resolve the errors highlighted in the form.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        imageBase64,
      };

      const res = await axios.post('/api/complaints', payload);

      if (res.data?.trackingId) {
        setSubmittedTrackingId(res.data.trackingId);
        toast.success('Grievance registered successfully!');
      }
    } catch (err: any) {
      console.error('Submission error:', err);
      const msg = err.response?.data?.error || 'Failed to submit grievance. Please try again.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-2 text-xs font-bold text-blue-700 uppercase tracking-widest">
          <span>Official Public Filing</span>
          <span>•</span>
          <span>Form GRV-01</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
          Lodge Citizen Grievance
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Provide complete factual details, upload authentic geo-tagged photo evidence, and specify
          the location for swift departmental intervention.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Grievance Details */}
        <div className="card space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center">
            <span className="mr-2">📋</span> 1. Grievance Information
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Grievance Subject / Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Deep dangerous pothole causing vehicular accidents near Metro Pillar 45"
              className={`input-field ${errors.title ? 'border-red-500' : ''}`}
            />
            {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
            <p className="text-[11px] text-slate-400 mt-1">Minimum 10 characters.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Preferred Category{' '}
                <span className="text-slate-400 font-normal">(Optional - AI will auto-categorize)</span>
              </label>
              <select
                name="categoryId"
                value={formData.categoryId || ''}
                onChange={handleInputChange}
                className="input-field bg-white"
              >
                <option value="">-- Let AI Classify Automatically --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Detailed Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Please provide complete context: when did the issue start, severity, hazard level, number of affected residents, and previous references if any..."
              className={`input-field ${errors.description ? 'border-red-500' : ''}`}
            />
            {errors.description && (
              <p className="text-xs text-red-600 mt-1">{errors.description}</p>
            )}
            <p className="text-[11px] text-slate-400 mt-1">Minimum 20 characters.</p>
          </div>
        </div>

        {/* Section 2: Photo Evidence with AI Inspection */}
        <div className="card space-y-4">
          <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center">
              <span className="mr-2">📷</span> 2. Photographic Evidence
            </h2>
            <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-md">
              AI Tamper Scanner Active
            </span>
          </div>

          <ImageUpload onImageSelect={handleImageSelect} />
        </div>

        {/* Section 3: Geotagged Location */}
        <div className="card space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center">
            <span className="mr-2">📍</span> 3. Location & Geospatial Tagging
          </h2>

          <MapPicker
            onLocationSelect={handleLocationSelect}
            initialLat={formData.locationLat || 28.6139}
            initialLng={formData.locationLng || 77.209}
            initialAddress={formData.locationAddress || ''}
          />
        </div>

        {/* Action Button */}
        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary min-w-[200px]">
            {isSubmitting ? (
              <span className="flex items-center space-x-2">
                <span className="animate-spin">⏳</span>
                <span>Dispatching to AI Pipeline...</span>
              </span>
            ) : (
              'Submit Grievance'
            )}
          </button>
        </div>
      </form>

      {/* Success Modal */}
      <Modal
        isOpen={!!submittedTrackingId}
        onClose={() => router.push(`/track/${submittedTrackingId}`)}
        title="Grievance Registered Successfully"
        size="md"
      >
        <div className="text-center space-y-4 py-2">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl">
            ✓
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Grievance Dispatched to Department
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Your complaint has entered the verification pipeline and will be routed autonomously.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 my-2">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
              Your Unique Tracking ID
            </p>
            <p className="text-2xl font-mono font-black text-blue-950 mt-1 tracking-wider">
              {submittedTrackingId}
            </p>
            <p className="text-[11px] text-blue-600 mt-1">
              Save this ID to monitor real-time updates and departmental remarks.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Link
              href={`/track/${submittedTrackingId}`}
              className="btn-primary flex-1 text-center py-2.5"
            >
              Track Grievance Live &rarr;
            </Link>
            <button
              type="button"
              onClick={() => {
                setSubmittedTrackingId(null);
                setFormData({
                  title: '',
                  description: '',
                  categoryId: undefined,
                  locationLat: 28.6139,
                  locationLng: 77.209,
                  locationAddress: '',
                });
                setImageBase64(null);
              }}
              className="btn-secondary flex-1 text-center py-2.5"
            >
              File Another
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
