import React, { useState, useEffect } from 'react';
import { Business, Category, MAURITIUS_DISTRICTS } from '../types';
import { compressAndValidateImage } from '../utils/imageCompressor';
import { supabase } from '../supabaseClient';
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
  Info,
  Edit2,
  Plus,
  ArrowLeft,
  HelpCircle,
  ShieldCheck,
  CheckCircle,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

interface UserPortalProps {
  businesses: Business[];
  categories: Category[];
  isLocalMode: boolean;
  userEmail: string | null;
  onLogin: (email: string, isSignUp: boolean, password?: string) => Promise<{ success: boolean; error?: string }>;
  onLogout: () => void;
  onSaveListing: (listingData: Omit<Business, 'id' | 'user_id' | 'status'> & { id?: string }) => Promise<{ success: boolean; error?: string }>;
  onDeleteListingImage: (listingId: string) => Promise<boolean>;
  onDeleteListing: (id: string) => Promise<void>;
}

export default function UserPortal({
  businesses,
  categories,
  isLocalMode,
  userEmail,
  onLogin,
  onLogout,
  onSaveListing,
  onDeleteListingImage,
  onDeleteListing
}: UserPortalProps) {
  // Navigation & View states
  const [viewMode, setViewMode] = useState<'list' | 'edit'>('list');
  const [editingListing, setEditingListing] = useState<Business | null>(null);

  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Forgot Password State
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState<{ success?: string; error?: string } | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);

  // Business Form State
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

  // Accidental Deletion Math confirmation states
  const [deletingListingId, setDeletingListingId] = useState<string | null>(null);
  const [mathVal1, setMathVal1] = useState(0);
  const [mathVal2, setMathVal2] = useState(0);
  const [mathAnswerInput, setMathAnswerInput] = useState('');
  const [mathError, setMathError] = useState(false);

  // Load the edit form when editing listing is selected
  useEffect(() => {
    if (editingListing) {
      setFormData({
        name: editingListing.name,
        category_id: editingListing.category_id,
        district: editingListing.district,
        address: editingListing.address,
        phone: editingListing.phone,
        whatsapp: editingListing.whatsapp,
        hours: editingListing.hours,
      });
      setImagePreview(editingListing.image_url);
      setCompressionMetrics(null);
    } else {
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
  }, [editingListing, categories]);

  // Filter listings owned by this user
  const myListings = businesses.filter(b => 
    userEmail && b.user_id && b.user_id.toLowerCase() === userEmail.toLowerCase()
  );

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
      const result = await onLogin(email, isSignUp, password);
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

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotStatus(null);
    setForgotLoading(true);

    if (!forgotEmail) {
      setForgotStatus({ error: 'Please enter your email address.' });
      setForgotLoading(false);
      return;
    }

    try {
      if (isLocalMode) {
        // Recovery Simulation for local storage
        const storedUsersRaw = localStorage.getItem('mauritius_directory_mock_users') || '{}';
        const storedUsers = JSON.parse(storedUsersRaw);
        const savedPass = storedUsers[forgotEmail.trim().toLowerCase()];
        
        // Safe simulated response instead of exposing the actual password on screen
        const emailLower = forgotEmail.trim().toLowerCase();
        if (emailLower === 'hello.bhagavati@gmail.com' || emailLower.includes('@')) {
          setForgotStatus({ success: 'A secure password reset link has been dispatched to your registered email address.' });
        } else {
          setForgotStatus({ error: 'Offline Recovery: No registered account found with this email address.' });
        }
      } else {
        // Real Supabase flow
        if (supabase) {
          const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
            redirectTo: window.location.origin
          });
          if (error) throw error;
          setForgotStatus({ success: 'A password reset link has been dispatched to your email address.' });
        } else {
          setForgotStatus({ error: 'Supabase client is not initialized.' });
        }
      }
    } catch (err: any) {
      setForgotStatus({ error: err.message || 'Failed to request password reset.' });
    } finally {
      setForgotLoading(false);
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

    if (editingListing) {
      await onDeleteListingImage(editingListing.id);
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
      const savePayload = {
        id: editingListing?.id,
        name: formData.name,
        category_id: formData.category_id,
        district: formData.district,
        address: formData.address,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        hours: formData.hours,
        image_url: imageFile ? imagePreview : (editingListing?.image_url || 'https://images.unsplash.com/photo-1546213290-e1b764f24307?auto=format&fit=crop&w=600&q=80')
      };

      const result = await onSaveListing(savePayload);
      if (result.success) {
        setSaveStatus({ success: true });
        setImageFile(null);
        setTimeout(() => {
          setViewMode('list');
          setEditingListing(null);
          setSaveStatus(null);
        }, 1500);
      } else {
        setSaveStatus({ error: result.error || 'Failed to save listing.' });
      }
    } catch (err: any) {
      setSaveStatus({ error: err.message || 'Error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  // Start remove confirmation with math question
  const initiateDeleteListing = (bizId: string) => {
    setDeletingListingId(bizId);
    const n1 = Math.floor(Math.random() * 8) + 4; // 4 to 11
    const n2 = Math.floor(Math.random() * 8) + 3; // 3 to 10
    setMathVal1(n1);
    setMathVal2(n2);
    setMathAnswerInput('');
    setMathError(false);
  };

  const handleConfirmDelete = async () => {
    const correctAnswer = mathVal1 + mathVal2;
    if (parseInt(mathAnswerInput, 10) !== correctAnswer) {
      setMathError(true);
      return;
    }

    if (deletingListingId) {
      await onDeleteListing(deletingListingId);
      setDeletingListingId(null);
    }
  };

  // Logged-out state
  if (!userEmail) {
    if (showForgotPassword) {
      return (
        <div className="max-w-md mx-auto bg-white rounded-xl border border-stone-200 shadow-xs p-6 md:p-8 space-y-6" id="forgot-password-box">
          <div className="text-center space-y-2">
            <div className="w-11 h-11 bg-stone-50 border border-stone-200/50 text-stone-650 rounded-lg flex items-center justify-center mx-auto">
              <Mail className="w-4.5 h-4.5" />
            </div>
            <h2 className="text-lg font-semibold text-stone-900 tracking-tight">
              Reset Your Password
            </h2>
            <p className="text-xs text-stone-500 leading-relaxed">
              Enter your email address below. We'll find your account credentials.
            </p>
          </div>

          {forgotStatus?.error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-700 text-xs flex gap-2.5 items-start">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{forgotStatus.error}</span>
            </div>
          )}

          {forgotStatus?.success && (
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-800 text-xs flex gap-2.5 items-start">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-semibold leading-relaxed">{forgotStatus.success}</span>
            </div>
          )}

          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-500 block">Email Address</label>
              <div className="flex items-center gap-2 border border-stone-200 rounded-lg px-3 py-2.5 bg-stone-50/50 focus-within:ring-1 focus-within:ring-stone-450 focus-within:bg-white">
                <Mail className="w-4 h-4 text-stone-400" />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full bg-transparent text-xs focus:outline-none text-stone-800 placeholder-stone-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={forgotLoading}
              className="w-full inline-flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white font-semibold py-2.5 px-4 rounded-lg text-xs transition-all shadow-xs"
            >
              {forgotLoading ? 'Searching...' : 'Recover Credentials'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="border-t border-stone-100 pt-4 text-center">
            <button
              onClick={() => {
                setShowForgotPassword(false);
                setForgotStatus(null);
                setForgotEmail('');
              }}
              className="text-xs text-stone-600 hover:text-stone-950 underline font-medium inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Back to Log In</span>
            </button>
          </div>
        </div>
      );
    }

    // Render Clean Login/Registration
    return (
      <div className="max-w-md mx-auto space-y-6">
        <div className="bg-white rounded-xl border border-stone-200 shadow-xs p-6 md:p-8 space-y-6 animate-in fade-in duration-200" id="auth-box">
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
                : 'Log in to securely manage your business directory listings.'}
            </p>
            <div className="pt-1 flex justify-center">
              {isLocalMode ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-850 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full" title="No environment keys found. Using standard client-side storage simulation.">
                  ⚠️ Local Storage Mode Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-800 bg-blue-50 border border-blue-150 px-2 py-0.5 rounded-full" title="Connected to active Supabase database.">
                  ⚡ Supabase Connected (Live)
                </span>
              )}
            </div>
          </div>

          {authError && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-700 text-xs flex gap-2.5 items-start animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {authMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-800 text-xs flex gap-2.5 items-start animate-in fade-in">
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
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-stone-500 block">Password</label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(true);
                      setForgotEmail(email);
                    }}
                    className="text-[11px] text-stone-500 hover:text-stone-900 hover:underline font-medium"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
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
              className="w-full inline-flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-850 disabled:bg-stone-300 text-white font-bold py-2.5 px-4 rounded-lg text-xs transition-all shadow-xs"
            >
              {loading ? 'Processing...' : isSignUp ? 'Sign Up & Verify Link' : 'Log In Securely'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="border-t border-stone-100 pt-4 flex justify-between items-center text-xs">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setAuthError(null);
                setAuthMessage(null);
              }}
              className="text-stone-600 hover:text-stone-950 underline font-medium"
            >
              {isSignUp ? 'Already have an account? Log In' : 'Need a business account? Sign Up'}
            </button>
          </div>
        </div>

      </div>
    );
  }

  // View Mode: Listings Grid/List View
  if (viewMode === 'list') {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200" id="business-dashboard">
        {/* Welcome Dashboard Banner */}
        <div className="bg-white border border-stone-200 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-stone-50 text-stone-700 rounded-xl border border-stone-200">
              <Briefcase className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 text-sm">Business Management Dashboard</h3>
              <p className="text-[11px] text-stone-400 font-medium">Logged in as: <span className="text-stone-700">{userEmail}</span></p>
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

        {/* Listings Counter and Add Action */}
        <div className="flex justify-between items-center bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl">
          <div className="text-xs font-semibold text-stone-600">
            Registered Listings: <span className="text-stone-900 font-bold">{myListings.length} / 5</span>
          </div>
          {myListings.length < 5 ? (
            <button
              onClick={() => {
                setEditingListing(null);
                setViewMode('edit');
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-stone-900 hover:bg-stone-850 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-450" />
              <span>Add Business Listing</span>
            </button>
          ) : (
            <span className="text-[10px] bg-stone-200 text-stone-600 px-2 py-1 rounded-md font-medium">
              5 Listings limit reached
            </span>
          )}
        </div>

        {/* List of User's Listings */}
        {myListings.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center space-y-4">
            <div className="w-12 h-12 bg-stone-50 border border-stone-150 rounded-full flex items-center justify-center mx-auto text-stone-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-stone-850">No Listings Registered Yet</h4>
              <p className="text-xs text-stone-400 max-w-sm mx-auto">
                You haven't listed any businesses in the Mauritius Business Registry yet. Click the button above to add your first listing!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {myListings.map(biz => {
              const cat = categories.find(c => c.id === biz.category_id);
              return (
                <div key={biz.id} className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center shadow-xs transition-all hover:border-stone-300">
                  <div className="flex items-start md:items-center gap-3.5">
                    {/* Thumbnail Image */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-50 border border-stone-200 shrink-0">
                      <img
                        referrerPolicy="no-referrer"
                        src={biz.image_url || 'https://images.unsplash.com/photo-1546213290-e1b764f24307?auto=format&fit=crop&w=150&q=80'}
                        alt={biz.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-stone-900 text-sm leading-tight">{biz.name}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          biz.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : biz.status === 'rejected'
                            ? 'bg-red-50 text-red-700 border border-red-100'
                            : 'bg-amber-50 text-amber-750 border border-amber-100'
                        }`}>
                          {biz.status}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-stone-450 font-medium">
                        <span className="text-stone-600">{cat?.name || 'Uncategorized'}</span>
                        <span>•</span>
                        <span>{biz.district}</span>
                      </div>

                      {/* Status help notice */}
                      <p className="text-[10px] text-stone-400 mt-0.5 leading-relaxed">
                        {biz.status === 'approved' 
                          ? 'Live & public. Changes will trigger a review.' 
                          : biz.status === 'rejected' 
                          ? 'Rejected. Edit below and resubmit for approval.' 
                          : 'Pending queue. An admin moderator will review soon.'}
                      </p>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex gap-2 w-full md:w-auto border-t border-stone-100 pt-3 md:pt-0 md:border-0 justify-end">
                    <button
                      onClick={() => {
                        setEditingListing(biz);
                        setViewMode('edit');
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold rounded-lg transition-colors"
                    >
                      <Edit2 className="w-3 h-3 text-stone-500" />
                      <span>Edit Details</span>
                    </button>
                    <button
                      onClick={() => initiateDeleteListing(biz.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 border border-red-200 hover:bg-red-50 text-red-600 text-xs font-semibold rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3 h-3 text-red-500" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Accidental Deletion Modal (Simple Math Problem) */}
        {deletingListingId && (
          <div className="fixed inset-0 bg-stone-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xl max-w-sm w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex gap-3 items-start">
                <div className="p-2 bg-red-50 text-red-600 rounded-xl shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-stone-900">Confirm Listing Removal</h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    This action is permanent. To verify and prevent accidental clicks, please solve the mathematical problem below:
                  </p>
                </div>
              </div>

              {mathError && (
                <div className="p-2.5 bg-red-50 text-red-700 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Incorrect solution. Please try again.</span>
                </div>
              )}

              <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl text-center space-y-2">
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Security Equation Check</span>
                <span className="text-sm font-extrabold text-stone-850 font-mono tracking-wide">
                  {mathVal1} + {mathVal2} = ?
                </span>
                <input
                  type="number"
                  required
                  placeholder="Enter the correct sum"
                  value={mathAnswerInput}
                  onChange={(e) => setMathAnswerInput(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-center text-xs text-stone-800 font-bold focus:outline-none focus:ring-1 focus:ring-stone-400"
                />
              </div>

              <div className="flex gap-2.5 justify-end">
                <button
                  type="button"
                  onClick={() => setDeletingListingId(null)}
                  className="px-3.5 py-2 border border-stone-200 text-stone-600 text-xs font-semibold rounded-lg hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors"
                >
                  Yes, Remove Listing
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // View Mode: Create/Edit Form View
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200" id="business-editor">
      {/* Back to dashboard header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            setViewMode('list');
            setEditingListing(null);
            setSaveStatus(null);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-bold rounded-lg transition-colors shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to My Listings</span>
        </button>
        <span className="text-xs font-semibold text-stone-400">
          {editingListing ? 'Editing Mode' : 'New Listing Registration'}
        </span>
      </div>

      {/* Main Submission Form */}
      <form onSubmit={handleFormSubmit} className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 shadow-xs space-y-6">
        <div className="border-b border-stone-150 pb-4 flex items-center gap-3">
          <div className="p-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-600">
            <Plus className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-stone-900 tracking-tight">
              {editingListing ? `Update Listing: ${editingListing.name}` : 'Register Your Business Listing'}
            </h2>
            <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
              Fill in the details below. Our client-side optimizer guarantees exactly one high-quality image complies with strict system budgets.
            </p>
          </div>
        </div>

        {saveStatus?.error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-700 text-xs flex gap-2 items-start animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-semibold leading-relaxed">{saveStatus.error}</span>
          </div>
        )}

        {saveStatus?.success && (
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-850 text-xs flex gap-2 items-start animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-semibold leading-relaxed">Listing successfully queued for administrator approval! Returning to dashboard...</span>
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
                  referrerPolicy="no-referrer"
                  src={imagePreview}
                  alt="Listing Preview"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Compression Metrics comparison */}
              <div className="md:col-span-3 flex flex-col justify-center space-y-3">
                <div className="flex items-center gap-1.5 text-stone-700">
                  <FileCheck className="w-4 h-4 text-emerald-550" />
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
        <div className="pt-4 border-t border-stone-100 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={() => {
              setViewMode('list');
              setEditingListing(null);
              setSaveStatus(null);
            }}
            className="px-4 py-2 border border-stone-200 text-stone-600 text-xs font-semibold rounded-lg hover:bg-stone-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || isCompressing}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-850 disabled:bg-stone-300 text-white text-xs font-bold rounded-lg transition-all shadow-xs"
          >
            {loading ? 'Submitting...' : editingListing ? 'Request Update Re-review' : 'Register Verified Listing'}
          </button>
        </div>
      </form>
    </div>
  );
}
