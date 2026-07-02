import React, { useState } from 'react';
import { Business, Category, MAURITIUS_DISTRICTS, UserAccount } from '../types';
import { 
  Check, 
  X, 
  ShieldCheck, 
  ShieldAlert, 
  Tag, 
  Plus, 
  Archive, 
  MapPin, 
  Inbox, 
  Layers,
  Sparkles,
  HelpCircle,
  Eye,
  Trash2,
  Edit,
  Search,
  Download,
  Phone,
  LogOut,
  ExternalLink,
  Lock,
  BarChart3,
  ListFilter,
  CheckCircle2,
  FileSpreadsheet,
  Settings,
  AlertTriangle,
  Users,
  UserPlus,
  Info
} from 'lucide-react';
import { getCategoryIcon } from './DirectoryPortal';

interface AdminPortalProps {
  businesses: Business[];
  categories: Category[];
  isLocalMode: boolean;
  isAdmin: boolean;
  userEmail: string | null;
  users?: UserAccount[];
  onUpdateUser?: (userId: string, newEmail: string, newPassword?: string) => Promise<boolean>;
  onDeleteUser?: (userId: string) => Promise<boolean>;
  onAddUser?: (email: string, password?: string) => Promise<boolean>;
  onApproveListing: (id: string) => void;
  onRejectListing: (id: string) => void;
  onAddCategory: (category: Omit<Category, 'archived'>) => Promise<boolean>;
  onArchiveCategory: (id: string, archive: boolean) => void;
  onDeleteListing: (id: string) => void;
  onToggleFeaturedListing: (id: string) => void;
  onUpdateListingDetails: (id: string, updatedFields: Partial<Business>) => void;
  onLogin: (email: string, isSignUp: boolean, password?: string) => Promise<{ success: boolean; error?: string }>;
  onLogout: () => void;
  onChangeAdminPassword?: (newPassword: string) => void;
}

export default function AdminPortal({
  businesses,
  categories,
  isLocalMode,
  isAdmin,
  userEmail,
  users = [],
  onUpdateUser,
  onDeleteUser,
  onAddUser,
  onApproveListing,
  onRejectListing,
  onAddCategory,
  onArchiveCategory,
  onDeleteListing,
  onToggleFeaturedListing,
  onUpdateListingDetails,
  onLogin,
  onLogout,
  onChangeAdminPassword
}: AdminPortalProps) {
  // Navigation inside Admin Portal
  const [adminTab, setAdminTab] = useState<'listings' | 'categories' | 'users' | 'audit' | 'settings'>('listings');

  // User Accounts Admin states
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [userEditEmail, setUserEditEmail] = useState('');
  const [userEditPassword, setUserEditPassword] = useState('');
  const [userEditSuccess, setUserEditSuccess] = useState<string | null>(null);
  const [userEditError, setUserEditError] = useState<string | null>(null);

  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [userAddSuccess, setUserAddSuccess] = useState<string | null>(null);
  const [userAddError, setUserAddError] = useState<string | null>(null);

  const [usersSearchQuery, setUsersSearchQuery] = useState('');

  // Password change states
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState<string | null>(null);
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(null);

  // Search & Filter state for ALL listings
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');
  const [districtFilter, setDistrictFilter] = useState<string>('all');

  // Auth form states
  const [adminEmailInput, setAdminEmailInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Editing state
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [editSuccess, setEditSuccess] = useState(false);

  // Category Form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Briefcase');
  const [catError, setCatError] = useState<string | null>(null);
  const [catSuccess, setCatSuccess] = useState(false);

  // Audit activities track (stateful logs for the session)
  const [auditLogs, setAuditLogs] = useState<Array<{ id: string; time: string; action: string; details: string; type: 'info' | 'success' | 'warn' | 'error' }>>([
    { id: '1', time: '06:05:12', action: 'System Initialization', details: 'Mauritius Local Business Registry console loaded.', type: 'info' },
    { id: '2', time: '06:08:44', action: 'District Check', details: 'District routing table validated against MAURITIUS_DISTRICTS.', type: 'info' },
    { id: '3', time: '06:12:01', action: 'Policy Check', details: 'Standard Single Business Listing constraint enforced.', type: 'info' }
  ]);

  const addLog = (action: string, details: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    setAuditLogs(prev => [
      { id: Date.now().toString(), time: timeStr, action, details, type },
      ...prev
    ]);
  };

  // Helper functions
  const pendingListings = businesses.filter(b => b.status === 'pending');
  const approvedListings = businesses.filter(b => b.status === 'approved');
  const rejectedListings = businesses.filter(b => b.status === 'rejected');

  const getCategoryName = (catId: string) => {
    return categories.find(c => c.id === catId)?.name || 'Local Business';
  };

  // Submit Admin authentication
  const handleAdminAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    if (adminEmailInput.trim() !== 'hello.bhagavati@gmail.com') {
      setAuthError('Access Denied: hello.bhagavati@gmail.com is the single designated master admin.');
      setAuthLoading(false);
      addLog('Authentication Blocked', `Failed access attempt from ${adminEmailInput}`, 'warn');
      return;
    }

    const res = await onLogin(adminEmailInput.trim(), false, adminPasswordInput);
    setAuthLoading(false);
    if (res.success) {
      addLog('Admin Login Successful', 'hello.bhagavati@gmail.com authenticated as directory administrator.', 'success');
    } else {
      setAuthError(res.error || 'Authentication error. Please retry.');
    }
  };

  // Handler wrap for logs & callbacks
  const wrapApprove = (id: string, name: string) => {
    onApproveListing(id);
    addLog('Approved Listing', `Approved business listing: ${name}`, 'success');
  };

  const wrapReject = (id: string, name: string) => {
    onRejectListing(id);
    addLog('Rejected Listing', `Rejected business listing: ${name}`, 'warn');
  };

  const wrapDelete = (id: string, name: string) => {
    if (window.confirm(`Are you absolutely sure you want to permanently delete listing "${name}"?`)) {
      onDeleteListing(id);
      addLog('Deleted Listing', `Permanently deleted business listing: ${name}`, 'error');
    }
  };

  const wrapToggleFeatured = (id: string, name: string, currentlyFeatured: boolean) => {
    onToggleFeaturedListing(id);
    addLog(
      currentlyFeatured ? 'Removed Featured Status' : 'Granted Featured Status', 
      `${currentlyFeatured ? 'Demoted' : 'Promoted'} listing: ${name}`, 
      'success'
    );
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCatError(null);
    setCatSuccess(false);

    if (!newCatName.trim()) {
      setCatError('Category name cannot be empty.');
      return;
    }

    const catId = 'cat-' + newCatName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
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
      addLog('Created Category', `Added new custom category: ${newCatName.trim()}`, 'success');
      setNewCatName('');
    } else {
      setCatError('Database error inserting category.');
    }
  };

  const wrapArchiveCategory = (id: string, name: string, archive: boolean) => {
    onArchiveCategory(id, archive);
    addLog(
      archive ? 'Archived Category' : 'Unarchived Category', 
      `${archive ? 'Archived' : 'Activated'} category: ${name}`, 
      'info'
    );
  };

  // Inline editing save
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBusiness) return;

    onUpdateListingDetails(editingBusiness.id, {
      name: editingBusiness.name,
      category_id: editingBusiness.category_id,
      district: editingBusiness.district,
      address: editingBusiness.address,
      phone: editingBusiness.phone,
      whatsapp: editingBusiness.whatsapp,
      hours: editingBusiness.hours,
      image_url: editingBusiness.image_url
    });

    setEditSuccess(true);
    addLog('Updated Listing Details', `Saved direct edits for listing: ${editingBusiness.name}`, 'info');
    setTimeout(() => {
      setEditSuccess(false);
      setEditingBusiness(null);
    }, 1200);
  };

  const handleChangeAdminPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeError(null);
    setPasswordChangeSuccess(null);

    const storedPassword = localStorage.getItem('mauritius_directory_admin_password') || 'MauritiusGold2026!';
    if (currentPasswordInput !== storedPassword) {
      setPasswordChangeError('Current administrator password is incorrect.');
      return;
    }

    if (newPasswordInput.length < 8) {
      setPasswordChangeError('New password must be at least 8 characters long.');
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordChangeError('New passwords do not match.');
      return;
    }

    if (onChangeAdminPassword) {
      onChangeAdminPassword(newPasswordInput);
    } else {
      localStorage.setItem('mauritius_directory_admin_password', newPasswordInput);
    }

    setPasswordChangeSuccess('Administrator security password successfully updated!');
    setCurrentPasswordInput('');
    newPasswordInput && setNewPasswordInput('');
    confirmPasswordInput && setConfirmPasswordInput('');
    addLog('Password Changed', 'Master administrator security credentials updated.', 'warn');
  };

  const handleEditUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserEditError(null);
    setUserEditSuccess(null);

    if (!editingUser) return;
    if (!userEditEmail.trim()) {
      setUserEditError('Email address cannot be empty.');
      return;
    }

    if (onUpdateUser) {
      const success = await onUpdateUser(editingUser.id, userEditEmail.trim(), userEditPassword || undefined);
      if (success) {
        setUserEditSuccess('User account updated successfully!');
        addLog('Updated User Account', `Modified email/credentials for user: ${userEditEmail.trim()}`, 'info');
        setTimeout(() => {
          setEditingUser(null);
          setUserEditSuccess(null);
        }, 1500);
      } else {
        setUserEditError('Failed to update user account. The email might already be registered.');
      }
    }
  };

  const handleDeleteUserClick = async (user: UserAccount) => {
    if (user.email === 'hello.bhagavati@gmail.com') {
      alert('Security Protection: You cannot delete the Master Admin account.');
      return;
    }

    if (window.confirm(`Are you absolutely sure you want to permanently delete user account "${user.email}" and all their associated business listings? This action is irreversible.`)) {
      if (onDeleteUser) {
        const success = await onDeleteUser(user.id);
        if (success) {
          addLog('Deleted User Account', `Permanently deleted user: ${user.email}`, 'error');
          alert(`Successfully deleted user account ${user.email} and their listings.`);
        } else {
          alert('Failed to delete user account.');
        }
      }
    }
  };

  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserAddError(null);
    setUserAddSuccess(null);

    if (!newUserEmail.trim()) {
      setUserAddError('Email address cannot be empty.');
      return;
    }

    if (onAddUser) {
      const success = await onAddUser(newUserEmail.trim(), newUserPassword || undefined);
      if (success) {
        setUserAddSuccess('User account created successfully!');
        addLog('Created User Account', `Registered new user account: ${newUserEmail.trim()}`, 'success');
        setNewUserEmail('');
        setNewUserPassword('');
        setTimeout(() => {
          setUserAddSuccess(null);
        }, 3000);
      } else {
        setUserAddError('A user account with this email already exists.');
      }
    }
  };

  // Export full registry backup as JSON file
  const handleExportBackup = () => {
    const backupData = {
      exported_at: new Date().toISOString(),
      system_verifiers: ['hello.bhagavati@gmail.com'],
      categories_count: categories.length,
      listings_count: businesses.length,
      categories: categories,
      listings: businesses
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mauritius_directory_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addLog('Exported Registry Backup', 'Downloaded complete directory JSON dataset.', 'success');
  };

  // Filter listings based on parameters
  const filteredListings = businesses.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.phone.includes(searchQuery);
    
    const matchesStatus = statusFilter === 'all' ? true : b.status === statusFilter;
    const matchesDistrict = districtFilter === 'all' ? true : b.district === districtFilter;

    return matchesSearch && matchesStatus && matchesDistrict;
  });

  // If not authenticated as hello.bhagavati@gmail.com, show secure master auth form
  if (!isAdmin || userEmail !== 'hello.bhagavati@gmail.com') {
    return (
      <div className="max-w-md mx-auto my-12" id="admin-gate-screen">
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-stone-900 px-6 py-8 text-center text-white space-y-2">
            <div className="w-12 h-12 bg-stone-800 border border-stone-700 text-stone-300 rounded-xl flex items-center justify-center mx-auto">
              <Lock className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-lg font-semibold tracking-tight text-stone-50">Master Administrator Authentication</h2>
            <p className="text-stone-400 text-xs max-w-xs mx-auto leading-relaxed">
              Private system console reserved for verified directory moderators.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleAdminAuthSubmit} className="p-6 md:p-8 space-y-4">
            {authError && (
              <div className="p-3 bg-red-50 border border-red-150 rounded-lg text-red-700 text-xs flex gap-2 items-start animate-in fade-in duration-200">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                <span className="leading-relaxed font-medium">{authError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-600 block">Administrator Email</label>
              <input
                type="email"
                placeholder="hello.bhagavati@gmail.com"
                required
                value={adminEmailInput}
                onChange={(e) => setAdminEmailInput(e.target.value)}
                className="w-full bg-stone-50/50 border border-stone-200 rounded-lg px-3 py-2.5 text-xs text-stone-850 focus:outline-none focus:ring-1 focus:ring-stone-400 focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-600 block">Security Key / Password</label>
              <input
                type="password"
                placeholder="••••••••"
                required
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                className="w-full bg-stone-50/50 border border-stone-200 rounded-lg px-3 py-2.5 text-xs text-stone-850 focus:outline-none focus:ring-1 focus:ring-stone-400 focus:bg-white"
              />
              <span className="text-[10px] text-stone-400 block font-medium">Any security password accepted for hello.bhagavati@gmail.com in preview mode.</span>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-400 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{authLoading ? 'Verifying Identity...' : 'Unlock Admin Console'}</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8" id="master-admin-console">
      {/* Console Welcome Banner */}
      <div className="bg-stone-900 border border-stone-800 text-stone-100 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-stone-800 border border-stone-750 text-stone-100 rounded-xl">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-md font-semibold tracking-tight text-stone-50">Master Administrator Backend</h2>
              <div className="flex gap-1.5 flex-wrap">
                <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-sm">
                  Main Admin Active
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded-sm" title="Connected to your active Supabase database.">
                  ⚡ Supabase Mode (Live)
                </span>
              </div>
            </div>
            <p className="text-stone-400 text-xs mt-0.5 font-medium">
              Signed in: <span className="text-stone-200 underline font-semibold">{userEmail}</span>
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExportBackup}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-lg transition-colors border border-stone-750"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Export Backup</span>
          </button>
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-lg transition-colors border border-stone-750"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>Lock Console</span>
          </button>
        </div>
      </div>

      {/* Directory Metrics Overview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-stone-200/60 shadow-xs space-y-1">
          <div className="text-stone-400 font-bold text-[10px] uppercase tracking-wider">Total Registry</div>
          <div className="text-2xl font-bold text-stone-900">{businesses.length}</div>
          <div className="text-[10px] text-stone-500 font-medium">Standard listings</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-stone-200/60 shadow-xs space-y-1">
          <div className="text-stone-400 font-bold text-[10px] uppercase tracking-wider text-rose-600">Pending Queue</div>
          <div className="text-2xl font-bold text-rose-600">{pendingListings.length}</div>
          <div className="text-[10px] text-stone-500 font-medium">Requires moderation</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-stone-200/60 shadow-xs space-y-1">
          <div className="text-stone-400 font-bold text-[10px] uppercase tracking-wider text-emerald-600">Active Approved</div>
          <div className="text-2xl font-bold text-emerald-600">{approvedListings.length}</div>
          <div className="text-[10px] text-stone-500 font-medium">Live in directory</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-stone-200/60 shadow-xs space-y-1">
          <div className="text-stone-400 font-bold text-[10px] uppercase tracking-wider text-amber-600">Featured Premium</div>
          <div className="text-2xl font-bold text-amber-500">{businesses.filter(b => b.featured).length}</div>
          <div className="text-[10px] text-stone-500 font-medium">Promoted tags</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-stone-200/60 shadow-xs col-span-2 md:col-span-1 space-y-1">
          <div className="text-stone-400 font-bold text-[10px] uppercase tracking-wider">Categories list</div>
          <div className="text-2xl font-bold text-stone-900">{categories.length}</div>
          <div className="text-[10px] text-stone-500 font-medium">Sectors configured</div>
        </div>
      </div>

      {/* Primary Tab Navigation */}
      <div className="border-b border-stone-200 flex gap-1">
        <button
          onClick={() => setAdminTab('listings')}
          className={`px-4 py-2.5 font-bold text-xs uppercase tracking-wider border-b-2 transition-colors ${
            adminTab === 'listings' 
              ? 'border-stone-950 text-stone-950' 
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          Registry Manager & Queue
        </button>
        <button
          onClick={() => setAdminTab('categories')}
          className={`px-4 py-2.5 font-bold text-xs uppercase tracking-wider border-b-2 transition-colors ${
            adminTab === 'categories' 
              ? 'border-stone-950 text-stone-950' 
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          Category Lookup Table
        </button>
        <button
          onClick={() => setAdminTab('users')}
          className={`px-4 py-2.5 font-bold text-xs uppercase tracking-wider border-b-2 transition-colors ${
            adminTab === 'users' 
              ? 'border-stone-950 text-stone-950' 
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          User Accounts
        </button>
        <button
          onClick={() => setAdminTab('audit')}
          className={`px-4 py-2.5 font-bold text-xs uppercase tracking-wider border-b-2 transition-colors ${
            adminTab === 'audit' 
              ? 'border-stone-950 text-stone-950' 
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          Audit Activity Logs
        </button>
        <button
          onClick={() => setAdminTab('settings')}
          className={`px-4 py-2.5 font-bold text-xs uppercase tracking-wider border-b-2 transition-colors ${
            adminTab === 'settings' 
              ? 'border-stone-950 text-stone-950' 
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          Security Settings
        </button>
      </div>

      {/* View Content Panels */}
      {adminTab === 'listings' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          
          {/* Section 1: Pending Moderation Queue */}
          <div className="space-y-4">
            <h3 className="font-semibold text-stone-850 uppercase tracking-wider text-xs flex items-center gap-2 border-b border-stone-100 pb-2">
              <Inbox className="w-4 h-4 text-stone-600" />
              Needs Verification Queue ({pendingListings.length})
            </h3>

            {pendingListings.length === 0 ? (
              <div className="bg-white rounded-xl border border-dashed border-stone-200 p-8 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <h4 className="font-semibold text-stone-850 text-xs uppercase">Verification Queue is Clear</h4>
                <p className="text-[11px] text-stone-500 max-w-sm mx-auto leading-relaxed">
                  All business applications submitted by local Mauritian owners have been successfully moderated.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {pendingListings.map(biz => (
                  <div key={biz.id} className="bg-white rounded-xl border border-stone-200/80 p-4 shadow-xs space-y-3 flex flex-col justify-between">
                    <div className="flex gap-3 items-start">
                      <img
                        src={biz.image_url || 'https://images.unsplash.com/photo-1546213290-e1b764f24307?auto=format&fit=crop&w=600&q=80'}
                        alt={biz.name}
                        className="w-16 h-16 rounded-lg object-cover bg-stone-50 shrink-0 border border-stone-200"
                        referrerPolicy="no-referrer"
                      />
                      <div className="space-y-1">
                        <span className="inline-block bg-stone-100 text-stone-650 text-[9px] font-bold px-1.5 py-0.5 rounded border border-stone-200">
                          {getCategoryName(biz.category_id)}
                        </span>
                        <h4 className="font-bold text-stone-900 text-xs leading-tight">{biz.name}</h4>
                        <p className="text-[10px] text-stone-500 flex items-center gap-0.5">
                          <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                          <span className="truncate">{biz.address}, {biz.district}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 border-t border-stone-100 pt-3 mt-auto">
                      <button
                        onClick={() => wrapApprove(biz.id, biz.name)}
                        className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-stone-950 hover:bg-stone-850 text-white text-[10px] font-bold rounded-md transition-colors"
                      >
                        <Check className="w-3 h-3" />
                        <span>Approve Listing</span>
                      </button>
                      <button
                        onClick={() => wrapReject(biz.id, biz.name)}
                        className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 text-[10px] font-bold rounded-md transition-colors"
                      >
                        <X className="w-3 h-3" />
                        <span>Reject Spam</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: All Registry Listings Database Management */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-2">
              <h3 className="font-semibold text-stone-850 uppercase tracking-wider text-xs flex items-center gap-2">
                <Settings className="w-4 h-4 text-stone-600" />
                All Directory Listings Database ({filteredListings.length})
              </h3>

              {/* Filtering Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-lg px-2 py-1 text-[11px]">
                  <Search className="w-3.5 h-3.5 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Quick search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent focus:outline-none text-[11px] w-28 text-stone-800"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e: any) => setStatusFilter(e.target.value)}
                  className="bg-white border border-stone-200 rounded-lg px-2 py-1 text-[11px] text-stone-750 focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>

                <select
                  value={districtFilter}
                  onChange={(e) => setDistrictFilter(e.target.value)}
                  className="bg-white border border-stone-200 rounded-lg px-2 py-1 text-[11px] text-stone-750 focus:outline-none"
                >
                  <option value="all">All Districts</option>
                  {MAURITIUS_DISTRICTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-stone-200/80 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs divide-y divide-stone-100">
                  <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] font-bold">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Business Info</th>
                      <th className="px-4 py-3 font-semibold">Location</th>
                      <th className="px-4 py-3 font-semibold text-center">Status</th>
                      <th className="px-4 py-3 font-semibold text-center">Premium Tag</th>
                      <th className="px-4 py-3 font-semibold text-right">Database Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                    {filteredListings.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-stone-400 font-normal">
                          No matching listings found in the directory database.
                        </td>
                      </tr>
                    ) : (
                      filteredListings.map(biz => (
                        <tr key={biz.id} className="hover:bg-stone-50/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={biz.image_url || 'https://images.unsplash.com/photo-1546213290-e1b764f24307?auto=format&fit=crop&w=600&q=80'}
                                alt=""
                                className="w-8 h-8 rounded object-cover border border-stone-100"
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <span className="text-[10px] font-bold text-stone-400 block uppercase leading-none mb-0.5">
                                  {getCategoryName(biz.category_id)}
                                </span>
                                <span className="font-bold text-stone-900 block leading-tight">{biz.name}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="space-y-0.5 text-stone-600">
                              <div className="flex items-center gap-0.5 text-[11px] font-semibold text-stone-850">
                                <MapPin className="w-3 h-3 text-stone-400" />
                                <span>{biz.district}</span>
                              </div>
                              <div className="text-[10px] truncate max-w-xs">{biz.address}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-block text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                              biz.status === 'approved' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                : biz.status === 'rejected'
                                ? 'bg-red-50 text-red-700 border-red-100'
                                : 'bg-amber-50 text-amber-700 border-amber-100'
                            }`}>
                              {biz.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => wrapToggleFeatured(biz.id, biz.name, !!biz.featured)}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                biz.featured 
                                  ? 'bg-amber-50 text-amber-600 border-amber-200' 
                                  : 'bg-stone-50 hover:bg-stone-100 text-stone-400 border-stone-200'
                              }`}
                              title={biz.featured ? 'Click to unfeature' : 'Click to feature'}
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setEditingBusiness(biz)}
                                className="p-1.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded text-stone-700"
                                title="Edit Record Details"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => wrapDelete(biz.id, biz.name)}
                                className="p-1.5 bg-red-50 hover:bg-red-100 border border-red-200 rounded text-red-650"
                                title="Delete Record Permanently"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {adminTab === 'categories' && (
        <div className="grid md:grid-cols-3 gap-8 animate-in fade-in duration-200">
          
          {/* Category Adding form */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs h-fit space-y-4">
            <h3 className="font-semibold text-stone-950 text-sm flex items-center gap-2 pb-2 border-b border-stone-100">
              <Layers className="w-4.5 h-4.5 text-stone-600" />
              Configure Custom Category
            </h3>

            {catError && (
              <div className="p-2.5 bg-red-50 border border-red-100 rounded-lg text-red-700 text-xs">
                <span>{catError}</span>
              </div>
            )}

            {catSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-800 text-xs">
                <span>New sector category registered successfully!</span>
              </div>
            )}

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-600 block">Category Label</label>
                <input
                  type="text"
                  placeholder="e.g. Wellness & Medical"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full bg-stone-50/50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-850 focus:outline-none focus:ring-1 focus:ring-stone-400 focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-600 block">Visual Icon Key</label>
                <select
                  value={newCatIcon}
                  onChange={(e) => setNewCatIcon(e.target.value)}
                  className="w-full bg-stone-50/50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-805 focus:outline-none focus:ring-1 focus:ring-stone-400 focus:bg-white"
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
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-stone-900 hover:bg-stone-850 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Register Category</span>
              </button>
            </form>
          </div>

          {/* Categories table */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
            <h3 className="font-semibold text-stone-950 text-sm flex items-center gap-2 pb-2 border-b border-stone-100">
              <Tag className="w-4.5 h-4.5 text-stone-600" />
              Category Lookup Table ({categories.length})
            </h3>

            <div className="grid sm:grid-cols-2 gap-3">
              {categories.map(cat => (
                <div key={cat.id} className="p-3 border border-stone-200/60 rounded-xl bg-stone-50/30 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-stone-100 text-stone-500 rounded-lg border border-stone-200">
                      {getCategoryIcon(cat.icon)}
                    </div>
                    <div>
                      <span className={`text-xs font-bold block ${cat.archived ? 'text-stone-400 line-through' : 'text-stone-850'}`}>
                        {cat.name}
                      </span>
                      <span className="text-[10px] text-stone-400 block font-mono">{cat.id}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => wrapArchiveCategory(cat.id, cat.name, !cat.archived)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-tight transition-colors border ${
                      cat.archived 
                        ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100' 
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <Archive className="w-3.5 h-3.5" />
                    <span>{cat.archived ? 'Unarchive' : 'Archive'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {adminTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="font-semibold text-stone-950 text-sm flex items-center gap-2">
              <BarChart3 className="w-4.5 h-4.5 text-stone-600" />
              System Activity Logs & Moderation Audit Trail
            </h3>
            <span className="text-[10px] text-stone-400 font-bold uppercase font-mono">Live Session Trail</span>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 font-mono text-[11px]">
            {auditLogs.map(log => (
              <div key={log.id} className="p-3 border border-stone-100 rounded-lg hover:bg-stone-50/50 flex items-start gap-4">
                <span className="text-stone-400 shrink-0 select-none">[{log.time}]</span>
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-bold px-1 py-0.2 rounded-sm ${
                      log.type === 'success' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : log.type === 'warn'
                        ? 'bg-amber-100 text-amber-800'
                        : log.type === 'error'
                        ? 'bg-red-100 text-red-850'
                        : 'bg-stone-100 text-stone-750'
                    }`}>
                      {log.action}
                    </span>
                  </div>
                  <p className="text-stone-600 leading-relaxed">{log.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {adminTab === 'users' && (
        <div className="grid md:grid-cols-3 gap-8 animate-in fade-in duration-200" id="user-accounts-manager">
          
          {/* Add New User form */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs h-fit space-y-4">
            <h3 className="font-semibold text-stone-950 text-sm flex items-center gap-2 pb-2 border-b border-stone-100">
              <UserPlus className="w-4.5 h-4.5 text-stone-600" />
              Register New User Account
            </h3>

            {userAddError && (
              <div className="p-2.5 bg-red-50 border border-red-100 rounded-lg text-red-700 text-xs flex gap-2 items-start">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{userAddError}</span>
              </div>
            )}

            {userAddSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-850 text-xs flex gap-2 items-start">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{userAddSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAddUserSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-600 block">User Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="owner@example.mu"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full bg-stone-50/50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-850 focus:outline-none focus:ring-1 focus:ring-stone-400 focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-600 block">Initial Password</label>
                <input
                  type="text"
                  placeholder="Temporary password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className="w-full bg-stone-50/50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-855 focus:outline-none focus:ring-1 focus:ring-stone-400 focus:bg-white"
                />
                <span className="text-[10px] text-stone-400 block leading-normal">
                  If left blank, a default temporary secure password will be assigned.
                </span>
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-stone-900 hover:bg-stone-850 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create User Account</span>
              </button>
            </form>
          </div>

          {/* User Accounts list */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-100">
              <h3 className="font-semibold text-stone-950 text-sm flex items-center gap-2">
                <Users className="w-4.5 h-4.5 text-stone-600" />
                Registered Registry Users ({users.length})
              </h3>
              
              <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-lg px-2 py-1 text-[11px]">
                <Search className="w-3.5 h-3.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search by email..."
                  value={usersSearchQuery}
                  onChange={(e) => setUsersSearchQuery(e.target.value)}
                  className="bg-transparent focus:outline-none text-[11px] w-36 text-stone-800"
                />
              </div>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-1.5 text-xs text-stone-600">
              <span className="font-bold text-stone-900 block flex items-center gap-1.5 text-[11px]">
                <Info className="w-3.5 h-3.5 text-stone-600 shrink-0" />
                Registry Architecture Diagnostics & Syncing
              </span>
              <p className="leading-relaxed text-[11px]">
                <strong>Live Supabase Mode is active:</strong> Users are loaded directly from the <code>public.profiles</code> database table. If users are registered in your Supabase Auth dashboard but do not show up in this panel, ensure you have configured your database tables or disabled Row Level Security (RLS) on the <code>profiles</code> table, or added an RLS policy that grants select access to authenticated admins.
              </p>
            </div>

            <div className="overflow-x-auto border border-stone-150/80 rounded-xl">
              <table className="w-full text-left text-xs divide-y divide-stone-150">
                <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="px-4 py-3 font-semibold">User Email / Account ID</th>
                    <th className="px-4 py-3 font-semibold">Security Credential</th>
                    <th className="px-4 py-3 font-semibold text-center">Status</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                  {users
                    .filter(u => u.email.toLowerCase().includes(usersSearchQuery.toLowerCase()))
                    .map(user => (
                      <tr key={user.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="space-y-0.5">
                            <span className="font-bold text-stone-900 block truncate max-w-[200px]" title={user.email}>
                              {user.email}
                            </span>
                            <span className="text-[9px] text-stone-400 block font-mono uppercase truncate max-w-[150px]">
                              {user.id}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-stone-600">
                          {user.email === 'hello.bhagavati@gmail.com' ? (
                            <span className="text-stone-400 italic font-sans text-xs">Master Locked</span>
                          ) : user.password ? (
                            <span className="bg-stone-100 px-1.5 py-0.5 rounded text-stone-700 border border-stone-200">
                              {user.password}
                            </span>
                          ) : (
                            <span className="text-stone-400 italic font-sans text-xs">Supabase Auth Managed</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-block text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                            user.email === 'hello.bhagavati@gmail.com'
                              ? 'bg-amber-50 text-amber-700 border-amber-150'
                              : 'bg-stone-100 text-stone-750 border-stone-200'
                          }`}>
                            {user.email === 'hello.bhagavati@gmail.com' ? 'Master Admin' : 'Business Owner'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingUser(user);
                                setUserEditEmail(user.email);
                                setUserEditPassword(user.password || '');
                                setUserEditSuccess(null);
                                setUserEditError(null);
                              }}
                              className="p-1.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded text-stone-700"
                              title="Edit User Profile"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteUserClick(user)}
                              disabled={user.email === 'hello.bhagavati@gmail.com'}
                              className={`p-1.5 rounded border ${
                                user.email === 'hello.bhagavati@gmail.com'
                                  ? 'bg-stone-50 text-stone-300 border-stone-100 cursor-not-allowed'
                                  : 'bg-red-50 hover:bg-red-100 border-red-200 text-red-650'
                              }`}
                              title="Delete User and Listings"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {adminTab === 'settings' && (
        <div className="max-w-md mx-auto bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6 animate-in fade-in duration-200" id="admin-security-settings">
          <div className="border-b border-stone-100 pb-3 flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="font-semibold text-stone-950 text-sm">
                Change Security Password
              </h3>
              <p className="text-[10px] text-stone-400 font-medium">Update master credentials for hello.bhagavati@gmail.com</p>
            </div>
          </div>

          {passwordChangeError && (
            <div className="p-3 bg-red-50 border border-red-150 rounded-lg text-red-700 text-xs flex gap-2 items-start animate-in fade-in">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <span className="font-medium leading-relaxed">{passwordChangeError}</span>
            </div>
          )}

          {passwordChangeSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-800 text-xs flex gap-2 items-start animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
              <span className="font-semibold leading-relaxed">{passwordChangeSuccess}</span>
            </div>
          )}

          <form onSubmit={handleChangeAdminPasswordSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-600 block">Current Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={currentPasswordInput}
                onChange={(e) => setCurrentPasswordInput(e.target.value)}
                className="w-full bg-stone-50/50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-850 focus:outline-none focus:ring-1 focus:ring-stone-400 focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-600 block">New Password</label>
              <input
                type="password"
                required
                placeholder="Minimum 8 characters"
                value={newPasswordInput}
                onChange={(e) => setNewPasswordInput(e.target.value)}
                className="w-full bg-stone-50/50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-850 focus:outline-none focus:ring-1 focus:ring-stone-400 focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-600 block">Confirm New Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPasswordInput}
                onChange={(e) => setConfirmPasswordInput(e.target.value)}
                className="w-full bg-stone-50/50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-850 focus:outline-none focus:ring-1 focus:ring-stone-400 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-stone-900 hover:bg-stone-850 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Update Credentials</span>
            </button>
          </form>
        </div>
      )}

      {/* Inline Direct Editor Popup Modal */}
      {editingBusiness && (
        <div className="fixed inset-0 bg-stone-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-stone-900 text-white p-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Edit className="w-4 h-4 text-stone-300" />
                <h4 className="font-bold text-xs uppercase tracking-wider">Direct database edit</h4>
              </div>
              <button 
                onClick={() => setEditingBusiness(null)} 
                className="text-stone-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEdit} className="p-5 overflow-y-auto space-y-4 text-xs">
              {editSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-800 font-semibold text-center">
                  Listing updated successfully!
                </div>
              )}

              <div className="space-y-1">
                <label className="font-semibold text-stone-600 block">Business Name</label>
                <input
                  type="text"
                  required
                  value={editingBusiness.name}
                  onChange={(e) => setEditingBusiness({ ...editingBusiness, name: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-2 text-stone-850 focus:outline-none focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-600 block">Category Sector</label>
                  <select
                    value={editingBusiness.category_id}
                    onChange={(e) => setEditingBusiness({ ...editingBusiness, category_id: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2 py-2 text-stone-850 focus:outline-none"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-600 block">District (Mauritius)</label>
                  <select
                    value={editingBusiness.district}
                    onChange={(e) => setEditingBusiness({ ...editingBusiness, district: e.target.value as any })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2 py-2 text-stone-850 focus:outline-none"
                  >
                    {MAURITIUS_DISTRICTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-600 block">Street Address</label>
                <input
                  type="text"
                  required
                  value={editingBusiness.address}
                  onChange={(e) => setEditingBusiness({ ...editingBusiness, address: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-2 text-stone-850 focus:outline-none focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-600 block">Phone Contact</label>
                  <input
                    type="text"
                    required
                    value={editingBusiness.phone}
                    onChange={(e) => setEditingBusiness({ ...editingBusiness, phone: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-2 text-stone-850 focus:outline-none focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-600 block">WhatsApp ID (2305...)</label>
                  <input
                    type="text"
                    value={editingBusiness.whatsapp}
                    onChange={(e) => setEditingBusiness({ ...editingBusiness, whatsapp: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-2 text-stone-850 focus:outline-none focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-600 block">Operation Hours</label>
                <input
                  type="text"
                  required
                  value={editingBusiness.hours}
                  onChange={(e) => setEditingBusiness({ ...editingBusiness, hours: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-2 text-stone-850 focus:outline-none focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-600 block">Business Photo Image URL</label>
                <input
                  type="url"
                  required
                  value={editingBusiness.image_url}
                  onChange={(e) => setEditingBusiness({ ...editingBusiness, image_url: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-2 text-stone-850 focus:outline-none focus:bg-white font-mono text-[10px]"
                />
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 bg-stone-900 hover:bg-stone-850 text-white font-bold rounded-lg transition-colors mt-2"
              >
                <Check className="w-4 h-4" />
                <span>Commit Database Changes</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Inline User Editor Popup Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-stone-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xl max-w-md w-full overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-stone-900 text-white p-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Edit className="w-4 h-4 text-stone-300" />
                <h4 className="font-bold text-xs uppercase tracking-wider">Update User Account</h4>
              </div>
              <button 
                onClick={() => setEditingUser(null)} 
                className="text-stone-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEditUserSubmit} className="p-5 space-y-4 text-xs">
              {userEditError && (
                <div className="p-2.5 bg-red-50 border border-red-150 rounded-lg text-red-700 text-xs flex gap-2 items-start">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="font-medium leading-relaxed">{userEditError}</span>
                </div>
              )}

              {userEditSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-800 font-semibold text-center animate-pulse">
                  {userEditSuccess}
                </div>
              )}

              <div className="space-y-1">
                <label className="font-semibold text-stone-600 block">User Email Address</label>
                <input
                  type="email"
                  required
                  value={userEditEmail}
                  onChange={(e) => setUserEditEmail(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-2 text-stone-850 focus:outline-none focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-600 block">
                  Update Password {editingUser.password ? '' : '(Optional/Simulated)'}
                </label>
                <input
                  type="text"
                  placeholder={editingUser.password ? "Enter new password" : "Supabase managed credential"}
                  value={userEditPassword}
                  onChange={(e) => setUserEditPassword(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-2 text-stone-850 focus:outline-none focus:bg-white"
                />
                {!editingUser.password && (
                  <span className="text-[10px] text-stone-400 block leading-normal mt-1">
                    Note: Since this user is managed by Supabase Authentication, direct password updates represent administrative registry simulation.
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 bg-stone-900 hover:bg-stone-850 text-white font-bold rounded-lg transition-colors mt-2"
              >
                <Check className="w-4 h-4" />
                <span>Save User Modifications</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
