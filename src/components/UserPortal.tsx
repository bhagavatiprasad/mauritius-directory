import React, { useState, useEffect } from 'react';
import { Business, Category, MAURITIUS_DISTRICTS } from '../types';
import { compressAndValidateImage } from '../utils/imageCompressor';
import { 
  User, 
  Lock, 
  Mail, 
  Briefcase, 
  Upload, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  FileCheck, 
  MapPin, 
  Phone, 
  Clock, 
  MessageSquare,
  ArrowRight,
  LogOut,
  Info
} from 'lucide-react';

interface UserPortalProps {
  businesses: Business[];
  categories: Category[];
  isLocalMode: boolean;
  userEmail: string | null;
  onLogin: (email: string, isSignUp: boolean) => Promise<{ success: boolean; error?: string }>;
  onLogout: () => void;
  onSaveListing: (listingData: Omit<Business, 'id' | 'user_id' | 'status'> & { id?: string }) => Promise<{ success: boolean; error?: string }>;
  onDeleteListingImage: (listingId: string) => Promise<boolean>;
}

export default function UserPortal({
  businesses,
  categories,
  isLocalMode,
  userEmail,
  onLogin,
  onLogout,
  onSaveListing,
  onDeleteListingImage
}: UserPortalProps) {
  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Business Form State
  const [userListing, setUserListing] = useState<Business | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    district: MAURITIUS_DISTRICTS[0] as string,
    address: '',
    phone: '',
    whatsapp: '',
    hours: 'Monday - Friday: 9:00 AM - 5:00 PM, Saturday: 9:00 AM - 1:00 PM',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [compressionMetrics, setCompressionMetrics] = useState<{
    originalSize: number;
    compressedSize: number;
    reducedPercent: number;
  } | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ success?: boolean; error?: string } | null>(null);

  // Fetch the current user's single business listing
  useEffect(() => {
    if (userEmail) {
      // Find listing owned by current mock or real user
      const existing = businesses.find(b => b.user_id === userEmail || (b.user_id && b.user_id.toLowerCase() === userEmail.toLowerCase()));
      if (existing) {
        setUserListing(existing);
        setFormData({
          name: existing.name,
          category_id: existing.category_id,
          district: existing.district,
          address: existing.address,
          phone: existing.phone,
          whatsapp: existing.whatsapp,
          hours: existing.hours,
        });
        setImagePreview(existing.image_url);
        setCompressionMetrics(null);
      } else {
        setUserListing(null);
        setFormData({
          name: '',
          category_id: categories[0]?.id || '',
          district: 'Port Louis',
          address: '',
          phone: '',
          whatsapp: '',
          hours: 'Monday - Friday: 9:00 AM - 5:00 PM, Saturday: 9:00 AM - 1:00 PM',
        });
        setImagePreview('');
        setCompressionMetrics(null);
      }
    }
  }, [userEmail, businesses, categories]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthMessage(null);
    setLoading(true);

    if (!email) {
      setAuthError('Please enter an email address.');
      setLoading(false);
      return;
    }

    try {
      const result = await onLogin(email, isSignUp);
      if (result.success) {
        if (isSignUp) {
          setAuthMessage(isLocalMode 
            ? 'Account registered successfully! Welcome aboard.' 
            : 'Verification link sent! Please check your email inbox to verify your account.'
          );
        }
      } else {
        setAuthError(result.error || 'Authentication failed. Please check credentials.');
      }
    } catch (err: any) {
      setAuthError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Strictly intercept, validate, and compress the image
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError(null);
    setIsCompressing(true);

    try {
      const result = await compressAndValidateImage(file);
      if (result.success && result.file) {
        setImageFile(result.file);
        setImagePreview(result.previewUrl || '');
        
        // Calculate saving percentage
        const original = result.originalSizeKB;
        const compressed = result.compressedSizeKB || 0;
        const reduced = original > 0 ? Math.round(((original - compressed) / original) * 100) : 0;

        setCompressionMetrics({
          originalSize: original,
          compressedSize: compressed,
          reducedPercent: reduced > 0 ? reduced : 0
        });
      } else {
        setImageError(result.error || 'Validation failed. Image exceeds constraints.');
        setImageFile(null);
        setCompressionMetrics(null);
      }
    } catch (err) {
      setImageError('Failed to process image. Make sure it is a valid format.');
      setImageFile(null);
      setCompressionMetrics(null);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleRemoveImage = async () => {
    setImageFile(null);
    setImagePreview('');
    setCompressionMetrics(null);
    setImageError(null);

    if (userListing) {
      await onDeleteListingImage(userListing.id);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus(null);

    if (!formData.name || !formData.category_id || !formData.address) {
      setSaveStatus({ error: 'Please fill in all required fields (Name, Category, and Address).' });
      return;
    }

    setLoading(true);

    try {
      // Save listing (handles creating new or updating existing single listing)
      const savePayload = {
        id: userListing?.id,
        name: formData.name,
        category_id: formData.category_id,
        district: formData.district,
        address: formData.address,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        hours: formData.hours,
        image_url: imageFile ? imagePreview : (userListing?.image_url || 'https://images.unsplash.com/photo-1546213290-e1b764f24307?auto=format&fit=crop&w=600&q=80')
      };

      const result = await onSaveListing(savePayload);
      if (result.success) {
        setSaveStatus({ success: true });
        setImageFile(null); // Clear pending file upload since it is saved
      } else {
        setSaveStatus({ error: result.error || 'Failed to save listing.' });
      }
    } catch (err: any) {
      setSaveStatus({ error: err.message || 'Error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  if (!userEmail) {
    // Render Auth Form (Login/Registration) - Clean Minimalism
    return (
      <div className="max-w-md mx-auto bg-white rounded-xl border border-stone-200 shadow-xs p-6 md:p-8 space-y-6" id="auth-box">
        <div className="text-center space-y-2">
          <div className="w-11 h-11 bg-stone-50 border border-stone-200/50 text-stone-650 rounded-lg flex items-center justify-center mx-auto">
            <Lock className="w-4.5 h-4.5" />
          </div>
          <h2 className="text-lg font-semibold text-stone-900 tracking-tight">
            {isSignUp ? 'Business Owner Signup' : 'Business Owner Portal'}
          </h2>
          <p className="text-xs text-stone-500 leading-relaxed">
            {isSignUp 
              ? 'Register your Mauritian business account to create and manage your directory listing.' 
              : 'Log in to manage your single business directory listing.'}
          </p>
        </div>

        {authError && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-700 text-xs flex gap-2.5 items-start">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{authError}</span>
          </div>
        )}

        {authMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-800 text-xs flex gap-2.5 items-start">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{authMessage}</span>
          </div>
        )}

        <form onSubmit={handleAuthSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-500 block">Email Address</label>
            <div className="flex items-center gap-2 border border-stone-200 rounded-lg px-3 py-2.5 bg-stone-50/50 focus-within:ring-1 focus-within:ring-stone-450 focus-within:bg-white">
              <Mail className="w-4 h-4 text-stone-400" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-xs focus:outline-none text-stone-800 placeholder-stone-400"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-500 block">Password</label>
            <div className="flex items-center gap-2 border border-stone-200 rounded-lg px-3 py-2.5 bg-stone-50/50 focus-within:ring-1 focus-within:ring-stone-450 focus-within:bg-white">
              <Lock className="w-4 h-4 text-stone-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-xs focus:outline-none text-stone-800 placeholder-stone-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white font-semibold py-2.5 px-4 rounded-lg text-xs transition-all shadow-xs"
          >
            {loading ? 'Processing...' : isSignUp ? 'Sign Up with Magic Link' : 'Log In Securely'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="border-t border-stone-100 pt-4 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setAuthError(null);
              setAuthMessage(null);
            }}
            className="text-xs text-stone-600 hover:text-stone-950 underline font-medium"
          >
            {isSignUp ? 'Already have an account? Log In' : 'Need a business account? Sign Up'}
          </button>
        </div>
      </div>
    );
  }

  // Logged-in Business Form
  return (
    <div className="max-w-2xl mx-auto space-y-6" id="business-dashboard">
      {/* Welcome Banner - Clean Minimalism */}
      <div className="bg-stone-50 border border-stone-200/60 p-5 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-stone-200/60 text-stone-700 rounded-lg border border-stone-300/30">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-stone-900 text-sm">Business Management Dashboard</h3>
            <p className="text-[11px] text-stone-500 mt-0.5">Logged in as: <span className="font-medium text-stone-700">{userEmail}</span></p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 text-xs font-semibold rounded-lg transition-colors border border-red-100"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Listing Status Display */}
      {userListing && (
        <div className={`p-4 rounded-xl border flex items-start gap-3 text-xs ${
          userListing.status === 'approved' 
            ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
            : userListing.status === 'rejected'
            ? 'bg-rose-50 border-rose-100 text-rose-800'
            : 'bg-amber-50 border-amber-100 text-amber-800'
        }`}>
          {userListing.status === 'approved' ? (
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
          ) : userListing.status === 'rejected' ? (
            <AlertCircle className="w-4.5 h-4.5 text-rose-600 shrink-0 mt-0.5" />
          ) : (
            <Info className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
          )}
          <div>
            <h4 className="font-semibold">
              Listing Status:{' '}
              {userListing.status.toUpperCase()}
            </h4>
            <p className="mt-0.5 opacity-90 leading-relaxed">
              {userListing.status === 'approved' 
                ? 'Your business is live and public! Any changes will revert your listing to pending for security re-review.'
                : userListing.status === 'rejected'
                ? 'Your listing was rejected. Please review the details below, make changes, and resubmit.'
                : 'Your submission is in the queue. A moderator will review and approve your listing shortly.'}
            </p>
          </div>
        </div>
      )}

      {/* Main Submission Form */}
      <form onSubmit={handleFormSubmit} className="bg-white rounded-xl border border-stone-200 p-6 md:p-8 shadow-xs space-y-6">
        <div className="border-b border-stone-150 pb-4">
          <h2 className="text-base font-semibold text-stone-900 tracking-tight">
            {userListing ? 'Update Your Business Listing' : 'Register Your Business Listing'}
          </h2>
          <p className="text-[11px] text-stone-500 mt-1">
            Fill in the details below. Exactly one high-resolution listing image is permitted.
          </p>
        </div>

        {saveStatus?.error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-700 text-xs flex gap-2 items-start">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{saveStatus.error}</span>
          </div>
        )}

        {saveStatus?.success && (
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-800 text-xs flex gap-2 items-start">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Listing submitted successfully for moderator approval!</span>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Business Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-600 block">Business Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              placeholder="e.g. Bella Vista Pizzeria"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-stone-50/50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-400 focus:bg-white"
            />
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-600 block">Business Category <span className="text-red-500">*</span></label>
            <select
              required
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full bg-stone-50/50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-400 focus:bg-white"
            >
              <option value="" disabled>Select Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* District Selection */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-600 block">District (Mauritius Standard) <span className="text-red-500">*</span></label>
            <select
              required
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              className="w-full bg-stone-50/50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-400 focus:bg-white"
            >
              {MAURITIUS_DISTRICTS.map(dist => (
                <option key={dist} value={dist}>{dist}</option>
              ))}
            </select>
          </div>

          {/* Phone Number */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-600 block">Phone Number</label>
            <input
              type="text"
              placeholder="e.g. +230 468 1234"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-stone-50/50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-400 focus:bg-white"
            />
          </div>

          {/* WhatsApp Direct */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-600 block">WhatsApp Number (For instant chats)</label>
            <input
              type="text"
              placeholder="e.g. 23051234567"
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              className="w-full bg-stone-50/50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-400 focus:bg-white"
            />
            <p className="text-[10px] text-stone-400">Include country code without signs (e.g., 23051234567).</p>
          </div>

          {/* Opening Hours */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-600 block">Opening Hours</label>
            <input
              type="text"
              placeholder="e.g. Mon-Fri: 9am-5pm, Sat: 9am-1pm"
              value={formData.hours}
              onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
              className="w-full bg-stone-50/50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-400 focus:bg-white"
            />
          </div>
        </div>

        {/* Address */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-stone-600 block">Full Physical Address <span className="text-red-500">*</span></label>
          <input
            type="text"
            required
            placeholder="e.g. Royal Road, Grand Baie"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full bg-stone-50/50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-400 focus:bg-white"
          />
        </div>

        {/* STRICT Exactly 1 Image Upload with Client-Side Compression Comparison */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-stone-700 block">
              Verified Business Photo (Exactly 1 image, JPG format, max 200KB limit)
            </label>
            {imagePreview && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-850 font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Image</span>
              </button>
            )}
          </div>

          {imageError && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-700 text-xs flex gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{imageError}</span>
            </div>
          )}

          {!imagePreview ? (
            <div className="relative border-2 border-dashed border-stone-200 rounded-xl p-6 text-center hover:border-stone-300 transition-colors bg-stone-50/30">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isCompressing}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="space-y-2">
                <div className="w-9 h-9 bg-white border border-stone-150 text-stone-400 rounded-lg flex items-center justify-center mx-auto shadow-xs">
                  {isCompressing ? (
                    <div className="w-4 h-4 border-2 border-stone-900 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Upload className="w-4.5 h-4.5 text-stone-500" />
                  )}
                </div>
                <div className="text-xs">
                  <span className="font-semibold text-stone-800">Click to upload photo</span> or drag and drop
                </div>
                <p className="text-[10px] text-stone-450">
                  JPEG, JPG, PNG, or WebP. Our client-side compression will optimize and convert it to JPEG under 200KB.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-5 gap-4 bg-stone-50 p-4 rounded-xl border border-stone-200">
              {/* Thumbnail */}
              <div className="md:col-span-2 relative h-36 rounded-lg overflow-hidden bg-stone-100 border border-stone-200">
                <img
                  src={imagePreview}
                  alt="Listing Preview"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Compression Metrics comparison */}
              <div className="md:col-span-3 flex flex-col justify-center space-y-3">
                <div className="flex items-center gap-1.5 text-stone-700">
                  <FileCheck className="w-4 h-4" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">Image Ready For Upload</span>
                </div>

                <div className="space-y-1 text-xs">
                  {compressionMetrics ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Original Size:</span>
                        <span className="font-semibold text-stone-700">{compressionMetrics.originalSize} KB</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Optimized Size:</span>
                        <span className="font-semibold text-stone-850">{compressionMetrics.compressedSize} KB</span>
                      </div>
                      <div className="flex justify-between bg-stone-200/50 p-1.5 rounded text-stone-800 font-semibold text-[10px] uppercase">
                        <span>Space Saved:</span>
                        <span>{compressionMetrics.reducedPercent}% compression ratio</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-[10px] text-stone-450">
                      This verified business photo is pre-saved and complies with the 200KB budget rule.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action submit button */}
        <div className="pt-4 border-t border-stone-100 flex justify-end">
          <button
            type="submit"
            disabled={loading || isCompressing}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-850 disabled:bg-stone-300 text-white text-xs font-semibold rounded-lg transition-all shadow-xs"
          >
            {loading ? 'Submitting...' : userListing ? 'Request Update Re-review' : 'Register Verified Listing'}
          </button>
        </div>
      </form>
    </div>
  );
}
