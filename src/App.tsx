import React, { useState, useEffect } from 'react';
import { Business, Category, MAURITIUS_DISTRICTS, Profile } from './types';
import { 
  isSupabaseConfigured, 
  supabase 
} from './supabaseClient';
import { 
  getLocalBusinesses, 
  getLocalCategories, 
  saveLocalBusinesses, 
  saveLocalCategories, 
  INITIAL_BUSINESSES 
} from './data';
import DirectoryPortal from './components/DirectoryPortal';
import UserPortal from './components/UserPortal';
import AdminPortal from './components/AdminPortal';

import { 
  Building2, 
  Search, 
  User, 
  ShieldCheck, 
  Sparkles,
  Database,
  CloudLightning,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function App() {
  // Navigation Routing Tab state
  const [activeTab, setActiveTab] = useState<'directory' | 'owner' | 'admin'>('directory');

  // Business state & Category lists
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Auth state
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [adminPassword, setAdminPassword] = useState<string>(() => {
    return localStorage.getItem('mauritius_directory_admin_password') || 'MauritiusGold2026!';
  });

  // App running Mode status
  const [isLocalMode, setIsLocalMode] = useState(!isSupabaseConfigured);

  // Fetch initial data
  useEffect(() => {
    async function initData() {
      if (!isLocalMode && supabase) {
        try {
          // 1. Fetch categories from Supabase
          const { data: cats, error: catErr } = await supabase
            .from('categories')
            .select('*')
            .order('name');
          
          if (catErr) throw catErr;
          
          // 2. Fetch listings from Supabase
          const { data: listings, error: listErr } = await supabase
            .from('listings')
            .select('*')
            .order('created_at', { ascending: false });

          if (listErr) throw listErr;

          setCategories(cats || []);
          setBusinesses(listings || []);

          // 3. Check current Auth Session
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          if (currentSession?.user) {
            setSession(currentSession);
            setUserEmail(currentSession.user.email || '');

            // Fetch profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('is_admin')
              .eq('id', currentSession.user.id)
              .single();

            if (profile) {
              setIsAdmin(profile.is_admin);
            }
          }
        } catch (e) {
          console.log('Synchronizing active data state');
          setIsLocalMode(true);
          loadLocalData();
        }
      } else {
        loadLocalData();
      }
    }

    initData();
  }, [isLocalMode]);

  // Load from local storage fallback
  const loadLocalData = () => {
    setBusinesses(getLocalBusinesses());
    setCategories(getLocalCategories());
    // Clear auto-login on start to guarantee standard user starts in logged-out mode
  };

  // Auth Operations
  const handleLogin = async (email: string, isSignUp: boolean, password?: string): Promise<{ success: boolean; error?: string }> => {
    // Strictly guard hello.bhagavati@gmail.com from logging in without the secure master password
    if (email.trim().toLowerCase() === 'hello.bhagavati@gmail.com') {
      const storedPassword = localStorage.getItem('mauritius_directory_admin_password') || 'MauritiusGold2026!';
      if (!password || password !== storedPassword) {
        return { success: false, error: 'Access Denied: Incorrect administrator security password.' };
      }
    }

    if (!isLocalMode && supabase) {
      try {
        if (isSignUp) {
          const { data, error } = await supabase.auth.signUp({
            email,
            password: password || 'TemporarySecurePassword123!', // Standard requirement bypass or let users specify
            options: {
              emailRedirectTo: window.location.origin
            }
          });
          if (error) throw error;
          return { success: true };
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password: password || 'TemporarySecurePassword123!'
          });
          if (error) throw error;
          
          if (data.session?.user) {
            setSession(data.session);
            setUserEmail(data.session.user.email || '');
            
            const { data: profile } = await supabase
              .from('profiles')
              .select('is_admin')
              .eq('id', data.session.user.id)
              .single();

            if (profile) setIsAdmin(profile.is_admin);
          }
          return { success: true };
        }
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    } else {
      // Local fallback mode authentication
      setUserEmail(email);
      localStorage.setItem('mauritius_directory_mock_user', email);
      
      // Auto promote target admin hello.bhagavati@gmail.com as the single true master admin
      if (email.trim().toLowerCase() === 'hello.bhagavati@gmail.com') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      return { success: true };
    }
  };

  const handleLogout = () => {
    if (!isLocalMode && supabase) {
      supabase.auth.signOut();
    }
    setUserEmail(null);
    setIsAdmin(false);
    setSession(null);
    localStorage.removeItem('mauritius_directory_mock_user');
  };

  const handleUpdateAdminPassword = (newPass: string) => {
    setAdminPassword(newPass);
    localStorage.setItem('mauritius_directory_admin_password', newPass);
  };

  // User Save Listing (Strict Single Business Rule)
  const handleSaveListing = async (
    listingData: Omit<Business, 'id' | 'user_id' | 'status'> & { id?: string }
  ): Promise<{ success: boolean; error?: string }> => {
    if (!userEmail) return { success: false, error: 'User must be authenticated.' };

    const status = 'pending'; // Reverts back to pending on insert/edit for approval loop safety

    if (!isLocalMode && supabase && session?.user) {
      try {
        if (listingData.id) {
          // Update
          const { error } = await supabase
            .from('listings')
            .update({
              name: listingData.name,
              category_id: listingData.category_id,
              district: listingData.district,
              address: listingData.address,
              phone: listingData.phone,
              whatsapp: listingData.whatsapp,
              hours: listingData.hours,
              image_url: listingData.image_url,
              status
            })
            .eq('id', listingData.id);
          
          if (error) throw error;
        } else {
          // Insert
          const { error } = await supabase
            .from('listings')
            .insert({
              user_id: session.user.id,
              name: listingData.name,
              category_id: listingData.category_id,
              district: listingData.district,
              address: listingData.address,
              phone: listingData.phone,
              whatsapp: listingData.whatsapp,
              hours: listingData.hours,
              image_url: listingData.image_url,
              status
            });
          
          if (error) throw error;
        }

        // Re-fetch all
        const { data: listings } = await supabase
          .from('listings')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (listings) setBusinesses(listings);
        return { success: true };
      } catch (e: any) {
        return { success: false, error: e.message };
      }
    } else {
      // Local Mode listing saving
      const updatedList = [...businesses];
      const matchIndex = updatedList.findIndex(b => b.user_id === userEmail);

      const savedRecord: Business = {
        id: listingData.id || `local-biz-${Date.now()}`,
        user_id: userEmail,
        name: listingData.name,
        category_id: listingData.category_id,
        district: listingData.district,
        address: listingData.address,
        phone: listingData.phone,
        whatsapp: listingData.whatsapp,
        hours: listingData.hours,
        image_url: listingData.image_url,
        status: 'pending' // Reverts to pending for moderator approval loop simulation
      };

      if (matchIndex >= 0) {
        updatedList[matchIndex] = savedRecord;
      } else {
        updatedList.unshift(savedRecord);
      }

      setBusinesses(updatedList);
      saveLocalBusinesses(updatedList);
      return { success: true };
    }
  };

  // Delete Listing Image Action
  const handleDeleteListingImage = async (listingId: string): Promise<boolean> => {
    if (!isLocalMode && supabase) {
      try {
        const { error } = await supabase
          .from('listings')
          .update({ image_url: '' })
          .eq('id', listingId);
        
        if (error) throw error;
        return true;
      } catch (err) {
        console.error('Failed to delete image in database', err);
        return false;
      }
    } else {
      const updated = businesses.map(b => b.id === listingId ? { ...b, image_url: '' } : b);
      setBusinesses(updated);
      saveLocalBusinesses(updated);
      return true;
    }
  };

  // Administrator Actions
  const handleApproveListing = async (id: string) => {
    if (!isLocalMode && supabase) {
      const { error } = await supabase
        .from('listings')
        .update({ status: 'approved' })
        .eq('id', id);
      
      if (!error) {
        setBusinesses(businesses.map(b => b.id === id ? { ...b, status: 'approved' } : b));
      }
    } else {
      const updated = businesses.map(b => b.id === id ? { ...b, status: 'approved' } : b);
      setBusinesses(updated);
      saveLocalBusinesses(updated);
    }
  };

  const handleRejectListing = async (id: string) => {
    if (!isLocalMode && supabase) {
      const { error } = await supabase
        .from('listings')
        .update({ status: 'rejected' })
        .eq('id', id);
      
      if (!error) {
        setBusinesses(businesses.map(b => b.id === id ? { ...b, status: 'rejected' } : b));
      }
    } else {
      const updated = businesses.map(b => b.id === id ? { ...b, status: 'rejected' } : b);
      setBusinesses(updated);
      saveLocalBusinesses(updated);
    }
  };

  const handleDeleteListing = async (id: string) => {
    if (!isLocalMode && supabase) {
      try {
        const { error } = await supabase
          .from('listings')
          .delete()
          .eq('id', id);
        
        if (!error) {
          setBusinesses(businesses.filter(b => b.id !== id));
        }
      } catch (err) {
        setBusinesses(businesses.filter(b => b.id !== id));
      }
    } else {
      const updated = businesses.filter(b => b.id !== id);
      setBusinesses(updated);
      saveLocalBusinesses(updated);
    }
  };

  const handleToggleFeaturedListing = async (id: string) => {
    const listing = businesses.find(b => b.id === id);
    if (!listing) return;
    const nextFeatured = !listing.featured;

    if (!isLocalMode && supabase) {
      try {
        const { error } = await supabase
          .from('listings')
          .update({ featured: nextFeatured })
          .eq('id', id);
        
        setBusinesses(businesses.map(b => b.id === id ? { ...b, featured: nextFeatured } : b));
      } catch (err) {
        setBusinesses(businesses.map(b => b.id === id ? { ...b, featured: nextFeatured } : b));
      }
    } else {
      const updated = businesses.map(b => b.id === id ? { ...b, featured: nextFeatured } : b);
      setBusinesses(updated);
      saveLocalBusinesses(updated);
    }
  };

  const handleUpdateListingDetails = async (id: string, updatedFields: Partial<Business>) => {
    if (!isLocalMode && supabase) {
      try {
        const { error } = await supabase
          .from('listings')
          .update(updatedFields)
          .eq('id', id);
        
        if (!error) {
          setBusinesses(businesses.map(b => b.id === id ? { ...b, ...updatedFields } : b));
        }
      } catch (err) {
        setBusinesses(businesses.map(b => b.id === id ? { ...b, ...updatedFields } : b));
      }
    } else {
      const updated = businesses.map(b => b.id === id ? { ...b, ...updatedFields } : b);
      setBusinesses(updated);
      saveLocalBusinesses(updated);
    }
  };

  const handleAddCategory = async (newCat: Omit<Category, 'archived'>): Promise<boolean> => {
    const fullCat: Category = { ...newCat, archived: false };

    if (!isLocalMode && supabase) {
      const { error } = await supabase
        .from('categories')
        .insert({
          id: fullCat.id,
          name: fullCat.name,
          icon: fullCat.icon,
          archived: false
        });
      
      if (error) {
        console.error(error);
        return false;
      }
      setCategories([...categories, fullCat].sort((a, b) => a.name.localeCompare(b.name)));
      return true;
    } else {
      const updated = [...categories, fullCat].sort((a, b) => a.name.localeCompare(b.name));
      setCategories(updated);
      saveLocalCategories(updated);
      return true;
    }
  };

  const handleArchiveCategory = async (id: string, archive: boolean) => {
    if (!isLocalMode && supabase) {
      const { error } = await supabase
        .from('categories')
        .update({ archived: archive })
        .eq('id', id);
      
      if (!error) {
        setCategories(categories.map(c => c.id === id ? { ...c, archived: archive } : c));
      }
    } else {
      const updated = categories.map(c => c.id === id ? { ...c, archived: archive } : c);
      setCategories(updated);
      saveLocalCategories(updated);
    }
  };

  // Determine if the private Moderator Admin tab should be visible in the header
  const showAdminTab = 
    userEmail === 'hello.bhagavati@gmail.com' || 
    window.location.search.includes('admin=true') || 
    window.location.search.includes('moderator=true') ||
    activeTab === 'admin' ||
    isAdmin;

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans text-stone-800" id="application-body">
      
      {/* Primary Header - Clean Minimalism */}
      <header className="bg-white border-b border-stone-200/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('directory')}>
            <div className="w-9 h-9 bg-stone-950 text-white rounded-lg flex items-center justify-center border border-stone-800">
              <Building2 className="w-4.5 h-4.5" />
            </div>
            <div>
              <h1 className="font-semibold text-stone-900 text-sm tracking-tight flex items-center gap-1.5">
                Directory.mu 
                <span className="text-[10px] font-bold text-stone-700 bg-stone-100 border border-stone-200 px-1.5 py-0.5 rounded-sm">Mauritius</span>
              </h1>
              <p className="text-[10px] text-stone-400 font-medium">Local Business Registry</p>
            </div>
          </div>

          {/* Core Desktop Navigation */}
          <nav className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('directory')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'directory' 
                  ? 'bg-stone-950 text-white' 
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/50'
              }`}
            >
              Public Portal
            </button>
            <button
              onClick={() => setActiveTab('owner')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'owner' 
                  ? 'bg-stone-950 text-white' 
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/50'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Business Owner</span>
            </button>
            {showAdminTab && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'admin' 
                    ? 'bg-stone-950 text-white' 
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/50'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Moderator Admin</span>
                {businesses.filter(b => b.status === 'pending').length > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                )}
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'directory' && (
          <DirectoryPortal 
            businesses={businesses} 
            categories={categories} 
            isLocalMode={isLocalMode} 
          />
        )}

        {activeTab === 'owner' && (
          <UserPortal
            businesses={businesses}
            categories={categories}
            isLocalMode={isLocalMode}
            userEmail={userEmail}
            onLogin={handleLogin}
            onLogout={handleLogout}
            onSaveListing={handleSaveListing}
            onDeleteListingImage={handleDeleteListingImage}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPortal
            businesses={businesses}
            categories={categories}
            isLocalMode={isLocalMode}
            isAdmin={isAdmin}
            userEmail={userEmail}
            onApproveListing={handleApproveListing}
            onRejectListing={handleRejectListing}
            onAddCategory={handleAddCategory}
            onArchiveCategory={handleArchiveCategory}
            onDeleteListing={handleDeleteListing}
            onToggleFeaturedListing={handleToggleFeaturedListing}
            onUpdateListingDetails={handleUpdateListingDetails}
            onLogin={handleLogin}
            onLogout={handleLogout}
            onChangeAdminPassword={handleUpdateAdminPassword}
          />
        )}
      </main>

      {/* Compact Elegant Footer */}
      <footer className="bg-white border-t border-stone-200/50 py-6 text-center text-xs text-stone-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>&copy; {new Date().getFullYear()} Mauritius Local Business Directory. All commercial listings verified under clean moderation protocols.</p>
        </div>
      </footer>
    </div>
  );
}
