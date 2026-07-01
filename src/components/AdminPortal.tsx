import React, { useState } from 'react';
import { Business, Category } from '../types';
import { 
  Check, 
  X, 
  ShieldCheck, 
  ShieldAlert, 
  Tag, 
  Plus, 
  Archive, 
  Calendar, 
  MapPin, 
  Inbox, 
  Layers,
  Sparkles,
  HelpCircle,
  Eye,
  Trash2
} from 'lucide-react';
import { getCategoryIcon } from './DirectoryPortal';

interface AdminPortalProps {
  businesses: Business[];
  categories: Category[];
  isLocalMode: boolean;
  isAdmin: boolean;
  userEmail: string | null;
  onApproveListing: (id: string) => void;
  onRejectListing: (id: string) => void;
  onAddCategory: (category: Omit<Category, 'archived'>) => Promise<boolean>;
  onArchiveCategory: (id: string, archive: boolean) => void;
  onToggleAdminSimulate: () => void;
}

export default function AdminPortal({
  businesses,
  categories,
  isLocalMode,
  isAdmin,
  userEmail,
  onApproveListing,
  onRejectListing,
  onAddCategory,
  onArchiveCategory,
  onToggleAdminSimulate
}: AdminPortalProps) {
  // Pending queue selection
  const pendingListings = businesses.filter(b => b.status === 'pending');
  
  // Category Form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Briefcase');
  const [catError, setCatError] = useState<string | null>(null);
  const [catSuccess, setCatSuccess] = useState(false);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCatError(null);
    setCatSuccess(false);

    if (!newCatName.trim()) {
      setCatError('Category name cannot be empty.');
      return;
    }

    const catId = 'cat-' + newCatName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    // Check if category already exists
    if (categories.some(c => c.id === catId)) {
      setCatError('A category with a similar name already exists.');
      return;
    }

    const success = await onAddCategory({
      id: catId,
      name: newCatName.trim(),
      icon: newCatIcon
    });

    if (success) {
      setCatSuccess(true);
      setNewCatName('');
    } else {
      setCatError('Database error inserting category.');
    }
  };

  const getCategoryName = (catId: string) => {
    return categories.find(c => c.id === catId)?.name || 'Local Business';
  };

  // If not admin, show Simulator promo screen - Clean Minimalism
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-xl border border-stone-200 shadow-xs p-6 md:p-8 text-center space-y-6" id="admin-gate">
        <div className="w-11 h-11 bg-stone-50 border border-stone-200 text-stone-700 rounded-lg flex items-center justify-center mx-auto">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-lg font-semibold text-stone-900 tracking-tight">Moderator Auth Gate</h2>
          <p className="text-xs text-stone-500 leading-relaxed">
            This console is restricted to registered directory administrators and system verifiers.
          </p>
        </div>

        <div className="bg-stone-50/50 rounded-lg p-4 border border-stone-200/60 space-y-3">
          <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
            Simulate Administrator Access
          </div>
          <p className="text-[11px] text-stone-500 leading-relaxed">
            To review pending directory submissions, reject spam, or edit categories, activate simulated moderator access below.
          </p>
          <button
            onClick={onToggleAdminSimulate}
            className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-850 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Simulate Admin Access</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8" id="admin-portal-dashboard">
      {/* Admin Panel Header - Clean Minimalism */}
      <div className="bg-stone-900 border border-stone-800 text-stone-100 p-5 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-stone-800 border border-stone-700 text-stone-300 rounded-lg">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold tracking-tight uppercase text-stone-50">Master Administrator Console</h2>
              <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-sm">
                Active
              </span>
            </div>
            <p className="text-stone-400 text-xs mt-0.5">
              Secure route managing Mauritius businesses, statuses, and custom dictionary tags.
            </p>
          </div>
        </div>

        <button
          onClick={onToggleAdminSimulate}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-lg transition-colors border border-stone-750"
        >
          <X className="w-3.5 h-3.5 text-rose-400" />
          <span>Exit Simulation</span>
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Pending Moderation Queue - Clean Minimalism */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="font-semibold text-stone-850 uppercase tracking-wider text-xs sm:text-sm flex items-center gap-2">
              <Inbox className="w-4 h-4 text-stone-700" />
              Pending Verification Queue ({pendingListings.length})
            </h3>
            <span className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">Moderation</span>
          </div>

          {pendingListings.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-stone-200 p-12 text-center space-y-3">
              <div className="w-11 h-11 bg-stone-50 border border-stone-150 text-emerald-600 rounded-lg flex items-center justify-center mx-auto">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-stone-850 text-sm">Queue is Clear</h4>
                <p className="text-xs text-stone-500 mt-1">
                  All business directory registrations have been successfully reviewed and processed.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingListings.map(biz => (
                <div 
                  key={biz.id}
                  className="bg-white rounded-xl border border-stone-200/60 p-5 shadow-xs flex flex-col sm:flex-row gap-4 justify-between"
                >
                  <div className="flex gap-4 items-start">
                    <img
                      src={biz.image_url}
                      alt={biz.name}
                      referrerPolicy="no-referrer"
                      className="w-20 h-20 rounded-lg object-cover bg-stone-50 shrink-0 border border-stone-200/50"
                    />
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1 bg-stone-100 text-stone-650 text-[10px] font-semibold px-2 py-0.5 rounded border border-stone-150">
                        {getCategoryName(biz.category_id)}
                      </div>
                      <h4 className="font-semibold text-stone-900 text-sm">{biz.name}</h4>
                      <p className="text-[11px] text-stone-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-stone-400" />
                        <span>{biz.address}, {biz.district}</span>
                      </p>
                      {biz.phone && (
                        <p className="text-[11px] text-stone-450">
                          Phone: <span className="font-medium text-stone-700">{biz.phone}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col justify-end gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-100">
                    <button
                      onClick={() => onApproveListing(biz.id)}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => onRejectListing(biz.id)}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg transition-colors border border-stone-200"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category Management */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
            <h3 className="font-semibold text-stone-950 text-sm flex items-center gap-2 pb-2 border-b border-stone-100">
              <Layers className="w-4.5 h-4.5 text-stone-600" />
              Category Manager
            </h3>

            {catError && (
              <div className="p-2.5 bg-red-50 border border-red-100 rounded-lg text-red-700 text-xs flex gap-1.5 items-start">
                <span>{catError}</span>
              </div>
            )}

            {catSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-800 text-xs flex gap-1.5 items-start">
                <span>Category inserted successfully!</span>
              </div>
            )}

            <form onSubmit={handleCreateCategory} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-550 block">Category Name</label>
                <input
                  type="text"
                  placeholder="e.g. Wellness & Medical"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full bg-stone-50/50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-400 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-550 block">Visual Icon Key</label>
                <select
                  value={newCatIcon}
                  onChange={(e) => setNewCatIcon(e.target.value)}
                  className="w-full bg-stone-50/50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-400 focus:bg-white"
                >
                  <option value="Utensils">Dining (Utensils)</option>
                  <option value="Hotel">Hotel (Bed)</option>
                  <option value="ShoppingBag">Shopping (Bag)</option>
                  <option value="Briefcase">Services (Briefcase)</option>
                  <option value="HeartPulse">Wellness (Heart)</option>
                  <option value="Compass">Activities (Compass)</option>
                  <option value="Sparkles">Beauty (Sparkles)</option>
                  <option value="Car">Automotive (Car)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-1 py-2 px-3 bg-stone-900 hover:bg-stone-850 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Category</span>
              </button>
            </form>
          </div>

          {/* Current Category Table */}
          <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Lookup Table ({categories.length})
            </h4>

            <div className="divide-y divide-stone-100 text-xs">
              {categories.map(cat => (
                <div key={cat.id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-stone-100 text-stone-500 rounded border border-stone-200/40">
                      {getCategoryIcon(cat.icon)}
                    </div>
                    <span className={`font-semibold ${cat.archived ? 'text-stone-400 line-through' : 'text-stone-700'}`}>
                      {cat.name}
                    </span>
                  </div>

                  <button
                    onClick={() => onArchiveCategory(cat.id, !cat.archived)}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded font-medium transition-colors text-[10px] ${
                      cat.archived 
                        ? 'bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-250' 
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200'
                    }`}
                  >
                    <Archive className="w-3 h-3" />
                    <span>{cat.archived ? 'Unarchive' : 'Archive'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
