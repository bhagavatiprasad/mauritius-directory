import React, { useState, useEffect } from 'react';
import { Business, Category, MAURITIUS_DISTRICTS, Profile, UserAccount } from './types';
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

  // Password Reset modal states
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

  // Parse recovery token on load
  useEffect(() => {
    const hash = window.location.hash || '';
    const search = window.location.search || '';
    if (
      hash.includes('type=recovery') || 
      search.includes('type=recovery') || 
      hash.includes('recovery_token=') || 
      (hash.includes('access_token=') && hash.includes('type=recovery'))
    ) {
      setIsRecoveryMode(true);
      setActiveTab('owner');
    }
  }, []);

  // Listen for Supabase auth state change events (including PASSWORD_RECOVERY)
  useEffect(() => {
    if (isLocalMode || !supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Supabase Auth Event:', event, session);
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryMode(true);
        setActiveTab('owner');
      }
      if (session?.user) {
        setSession(session);
        setUserEmail(session.user.email || '');
        
        // Fetch profile
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setIsAdmin(profile.is_admin || session.user.email === 'hello.bhagavati@gmail.com');
          } else if (session.user.email === 'hello.bhagavati@gmail.com') {
            setIsAdmin(true);
          }
        } catch (err) {
          console.error('Error fetching profile on auth state change:', err);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isLocalMode]);

  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(null);

    if (newPassword.length < 6) {
      setResetError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== resetConfirmPassword) {
      setResetError('Passwords do not match.');
      return;
    }

    setResetLoading(true);
    try {
      if (!isLocalMode && supabase) {
        const { error } = await supabase.auth.updateUser({
          password: newPassword
        });
        if (error) throw error;
        setResetSuccess('Password has been updated successfully!');
      } else {
        // Local mode fallback
        const storedUsersRaw = localStorage.getItem('mauritius_directory_mock_users') || '{}';
        const storedUsers = JSON.parse(storedUsersRaw);
        if (userEmail) {
          storedUsers[userEmail.toLowerCase()] = newPassword;
          localStorage.setItem('mauritius_directory_mock_users', JSON.stringify(storedUsers));
          setResetSuccess('Password updated successfully (Local Safe Fallback)!');
        } else {
          setResetError('No authenticated user session found to update.');
        }
      }
    } catch (err: any) {
      console.error('Password reset failure:', err);
      setResetError(err.message || 'Failed to update password.');
    } finally {
      setResetLoading(false);
    }
  };

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
              setIsAdmin(profile.is_admin || currentSession.user.email === 'hello.bhagavati@gmail.com');
            } else if (currentSession.user.email === 'hello.bhagavati@gmail.com') {
              setIsAdmin(true);
            }
          }

          // 4. Fetch profiles/users
          await loadSupabaseUsers();
        } catch (e) {
          console.error('Supabase active data synchronization or query failed:', e);
          // Load default categories and listings as visually safe placeholders
          loadLocalData();
          
          // Try to recover session from Supabase even if database queries had errors
          try {
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            if (currentSession?.user) {
              setSession(currentSession);
              setUserEmail(currentSession.user.email || '');

              const { data: profile } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', currentSession.user.id)
                .single();

              if (profile) {
                setIsAdmin(profile.is_admin || currentSession.user.email === 'hello.bhagavati@gmail.com');
              } else if (currentSession.user.email === 'hello.bhagavati@gmail.com') {
                setIsAdmin(true);
              }
            }
            await loadSupabaseUsers();
          } catch (sessionErr) {
            console.error('Failed to restore live session:', sessionErr);
            loadLocalUsers();
          }
        }
      } else {
        loadLocalData();
        loadLocalUsers();
      }
    }

    initData();
  }, [isLocalMode]);

  // Registered user accounts state
  const [users, setUsers] = useState<UserAccount[]>([]);

  // Load local users fallback
  const loadLocalUsers = () => {
    const storedUsersRaw = localStorage.getItem('mauritius_directory_mock_users') || '{}';
    let storedUsers: Record<string, string> = {};
    try {
      storedUsers = JSON.parse(storedUsersRaw);
    } catch (e) {
      storedUsers = {};
    }
    
    const localAdminsRaw = localStorage.getItem('mauritius_directory_local_admins') || '["hello.bhagavati@gmail.com"]';
    let localAdmins: string[] = [];
    try {
      localAdmins = JSON.parse(localAdminsRaw);
    } catch {
      localAdmins = ["hello.bhagavati@gmail.com"];
    }

    const adminPass = localStorage.getItem('mauritius_directory_admin_password') || 'MauritiusGold2026!';
    const userList: UserAccount[] = [];
    
    // Add master admin account
    userList.push({
      id: 'admin-id-hello-bhagavati',
      email: 'hello.bhagavati@gmail.com',
      is_admin: true,
      password: adminPass,
      created_at: new Date('2026-01-01').toISOString()
    });

    // Add other registered users from local state
    Object.entries(storedUsers).forEach(([email, pwd]) => {
      if (email !== 'hello.bhagavati@gmail.com') {
        userList.push({
          id: `local-user-${email}`,
          email: email,
          is_admin: localAdmins.includes(email),
          password: pwd,
          created_at: new Date('2026-06-15').toISOString()
        });
      }
    });

    setUsers(userList);
  };

  // Load users from Supabase with fallback to local storage
  const loadSupabaseUsers = async () => {
    if (!supabase) {
      loadLocalUsers();
      return;
    }
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) throw error;

      const userList: UserAccount[] = (profiles || []).map((p: any) => ({
        id: p.id,
        email: p.email || '',
        is_admin: !!p.is_admin,
        created_at: p.created_at || new Date().toISOString()
      }));

      // Force hello.bhagavati@gmail.com to exist in local/state list
      if (!userList.some(u => u.email === 'hello.bhagavati@gmail.com')) {
        const adminPass = localStorage.getItem('mauritius_directory_admin_password') || 'MauritiusGold2026!';
        userList.unshift({
          id: 'admin-id-hello-bhagavati',
          email: 'hello.bhagavati@gmail.com',
          is_admin: true,
          password: adminPass,
          created_at: new Date('2026-01-01').toISOString()
        });
      }

      setUsers(userList);
    } catch (err) {
      console.error('profiles fetch failed, falling back to local users state', err);
      loadLocalUsers();
    }
  };

  // Load from local storage fallback
  const loadLocalData = () => {
    setBusinesses(getLocalBusinesses());
    setCategories(getLocalCategories());
    // Clear auto-login on start to guarantee standard user starts in logged-out mode
  };

  // Auth Operations
  const handleLogin = async (email: string, isSignUp: boolean, password?: string): Promise<{ success: boolean; error?: string }> => {
    const emailLower = email.trim().toLowerCase();

    // Strictly guard hello.bhagavati@gmail.com from logging in without the secure master password in local mode only
    if (isLocalMode && emailLower === 'hello.bhagavati@gmail.com') {
      const storedPassword = localStorage.getItem('mauritius_directory_admin_password') || 'MauritiusGold2026!';
      if (!password || password !== storedPassword) {
        return { success: false, error: 'Access Denied: Incorrect administrator security password.' };
      }
    }

    if (!isLocalMode && supabase) {
      try {
        if (isSignUp) {
          const { data, error } = await supabase.auth.signUp({
            email: emailLower,
            password: password || 'TemporarySecurePassword123!', // Standard requirement bypass or let users specify
            options: {
              emailRedirectTo: window.location.origin
            }
          });
          if (error) throw error;
          return { success: true };
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: emailLower,
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

            if (profile) {
              setIsAdmin(profile.is_admin || data.session.user.email === 'hello.bhagavati@gmail.com');
            } else if (data.session.user.email === 'hello.bhagavati@gmail.com') {
              setIsAdmin(true);
            }
          }
          return { success: true };
        }
      } catch (err: any) {
        console.error('Authentication Error:', err);
        let msg = 'Authentication failed. Please check credentials.';
        if (err) {
          if (typeof err === 'string') {
            msg = err;
          } else if (err.message) {
            msg = err.message;
          } else if (err.error_description) {
            msg = err.error_description;
          } else if (err.error && typeof err.error === 'string') {
            msg = err.error;
          } else if (err.error && err.error.message) {
            msg = err.error.message;
          } else {
            msg = JSON.stringify(err);
            if (msg === '{}') {
              msg = err.statusText || err.name || 'Authentication request failed.';
            }
          }
        }
        return { success: false, error: msg };
      }
    } else {
      // Local fallback mode authentication
      const storedUsersRaw = localStorage.getItem('mauritius_directory_mock_users') || '{}';
      let storedUsers: Record<string, string> = {};
      try {
        storedUsers = JSON.parse(storedUsersRaw);
      } catch (e) {
        storedUsers = {};
      }

      if (isSignUp) {
        if (storedUsers[emailLower]) {
          return { success: false, error: 'An account with this email already exists. Please log in instead.' };
        }
        if (!password || password.length < 6) {
          return { success: false, error: 'Password must be at least 6 characters long.' };
        }
        storedUsers[emailLower] = password;
        localStorage.setItem('mauritius_directory_mock_users', JSON.stringify(storedUsers));
        
        setUserEmail(emailLower);
        localStorage.setItem('mauritius_directory_mock_user', emailLower);
        
        if (emailLower === 'hello.bhagavati@gmail.com') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
        return { success: true };
      } else {
        // If it's the admin email, we already checked its password above
        if (emailLower === 'hello.bhagavati@gmail.com') {
          setUserEmail(emailLower);
          localStorage.setItem('mauritius_directory_mock_user', emailLower);
          setIsAdmin(true);
          return { success: true };
        }

        const savedPassword = storedUsers[emailLower];
        if (!savedPassword) {
          return { success: false, error: 'No account found with this email. Please sign up first.' };
        }
        if (password !== savedPassword) {
          return { success: false, error: 'Incorrect password. Please try again.' };
        }

        setUserEmail(emailLower);
        localStorage.setItem('mauritius_directory_mock_user', emailLower);
        setIsAdmin(false);
        return { success: true };
      }
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
          // Insert - first check limit and 24 hour rule
          const userListings = businesses.filter(b => b.user_id === session.user.id);
          if (userListings.length >= 5) {
            return { success: false, error: 'Maximum business listing limit reached. You can only create up to 5 listings.' };
          }

          const lastCreated = userListings.reduce((latest, current) => {
            if (!current.created_at) return latest;
            if (!latest) return current;
            return new Date(current.created_at).getTime() > new Date(latest.created_at).getTime() ? current : latest;
          }, null as Business | null);

          if (lastCreated?.created_at) {
            const lastTime = new Date(lastCreated.created_at).getTime();
            const elapsed = Date.now() - lastTime;
            const limitMs = 24 * 60 * 60 * 1000;
            if (elapsed < limitMs) {
              const remainingMs = limitMs - elapsed;
              const remainingHrs = Math.floor(remainingMs / (1000 * 60 * 60));
              const remainingMins = Math.ceil((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
              return { 
                success: false, 
                error: `Cool-down Limit: You can only list one business every 24 hours. Please wait ${remainingHrs} hours and ${remainingMins} minutes before listing another business.` 
              };
            }
          }

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
              status,
              created_at: new Date().toISOString()
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
      const userListings = updatedList.filter(b => b.user_id === userEmail);

      // Check limits if inserting a new listing
      if (!listingData.id) {
        if (userListings.length >= 5) {
          return { success: false, error: 'Maximum business listing limit reached. You can only create up to 5 listings.' };
        }

        const lastCreated = userListings.reduce((latest, current) => {
          if (!current.created_at) return latest;
          if (!latest) return current;
          return new Date(current.created_at).getTime() > new Date(latest.created_at).getTime() ? current : latest;
        }, null as Business | null);

        if (lastCreated?.created_at) {
          const lastTime = new Date(lastCreated.created_at).getTime();
          const elapsed = Date.now() - lastTime;
          const limitMs = 24 * 60 * 60 * 1000;
          if (elapsed < limitMs) {
            const remainingMs = limitMs - elapsed;
            const remainingHrs = Math.floor(remainingMs / (1000 * 60 * 60));
            const remainingMins = Math.ceil((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
            return { 
              success: false, 
              error: `Cool-down Limit: You can only list one business every 24 hours. Please wait ${remainingHrs} hours and ${remainingMins} minutes before listing another business.` 
            };
          }
        }
      }

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
        status: 'pending', // Reverts to pending for moderator approval loop simulation
        created_at: listingData.id 
          ? (businesses.find(b => b.id === listingData.id)?.created_at || new Date().toISOString()) 
          : new Date().toISOString()
      };

      const matchIndex = updatedList.findIndex(b => b.id === savedRecord.id);

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
      
      if (error) {
        console.error('Failed to approve listing:', error);
        alert(`Database Error: Could not approve listing. Details: ${error.message}`);
      } else {
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
      
      if (error) {
        console.error('Failed to reject listing:', error);
        alert(`Database Error: Could not reject listing. Details: ${error.message}`);
      } else {
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
        
        if (error) {
          console.error('Failed to delete listing:', error);
          alert(`Database Error: Could not delete listing. Details: ${error.message}`);
        } else {
          setBusinesses(businesses.filter(b => b.id !== id));
        }
      } catch (err: any) {
        console.error('Delete error exception:', err);
        alert(`Error: ${err.message || 'Failed to communicate with database.'}`);
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
        
        if (error) {
          console.error('Failed to toggle featured state:', error);
          alert(`Database Error: Could not change featured state. Details: ${error.message}`);
        } else {
          setBusinesses(businesses.map(b => b.id === id ? { ...b, featured: nextFeatured } : b));
        }
      } catch (err: any) {
        console.error('Toggle featured exception:', err);
        alert(`Error: ${err.message || 'Failed to update featured state.'}`);
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

  const handleUpdateUser = async (userId: string, newEmail: string, newPassword?: string, isAdminValue?: boolean): Promise<boolean> => {
    const emailLower = newEmail.trim().toLowerCase();
    const oldUser = users.find(u => u.id === userId);
    if (!oldUser) return false;
    const oldEmail = oldUser.email;
    const finalIsAdmin = isAdminValue !== undefined ? isAdminValue : oldUser.is_admin;

    if (!isLocalMode && supabase) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ 
            email: emailLower,
            is_admin: finalIsAdmin
          })
          .eq('id', userId);
        
        if (error) throw error;
        await loadSupabaseUsers();
        return true;
      } catch (err) {
        console.error('Supabase profile update failed, applying simulated update', err);
      }
    }

    const storedUsersRaw = localStorage.getItem('mauritius_directory_mock_users') || '{}';
    let storedUsers: Record<string, string> = {};
    try {
      storedUsers = JSON.parse(storedUsersRaw);
    } catch (e) {
      storedUsers = {};
    }

    const password = newPassword || storedUsers[oldEmail] || 'TemporarySecurePassword123!';
    delete storedUsers[oldEmail];
    storedUsers[emailLower] = password;

    localStorage.setItem('mauritius_directory_mock_users', JSON.stringify(storedUsers));

    const localAdminsRaw = localStorage.getItem('mauritius_directory_local_admins') || '["hello.bhagavati@gmail.com"]';
    let localAdmins: string[] = [];
    try {
      localAdmins = JSON.parse(localAdminsRaw);
    } catch {
      localAdmins = ["hello.bhagavati@gmail.com"];
    }

    if (finalIsAdmin) {
      if (!localAdmins.includes(emailLower)) {
        localAdmins.push(emailLower);
      }
    } else {
      localAdmins = localAdmins.filter(email => email !== emailLower);
    }
    // ensure hello.bhagavati@gmail.com is always admin
    if (!localAdmins.includes('hello.bhagavati@gmail.com')) {
      localAdmins.push('hello.bhagavati@gmail.com');
    }
    localStorage.setItem('mauritius_directory_local_admins', JSON.stringify(localAdmins));

    if (emailLower === 'hello.bhagavati@gmail.com' && newPassword) {
      handleUpdateAdminPassword(newPassword);
    }

    const updatedListings = businesses.map(b => b.user_id === oldEmail ? { ...b, user_id: emailLower } : b);
    setBusinesses(updatedListings);
    saveLocalBusinesses(updatedListings);

    loadLocalUsers();
    return true;
  };

  const handleDeleteUser = async (userId: string): Promise<boolean> => {
    const userToDelete = users.find(u => u.id === userId);
    if (!userToDelete) return false;
    const userEmailToDelete = userToDelete.email;

    if (userEmailToDelete === 'hello.bhagavati@gmail.com') {
      return false;
    }

    if (!isLocalMode && supabase) {
      try {
        const { error: profileErr } = await supabase
          .from('profiles')
          .delete()
          .eq('id', userId);
        
        const { error: listingsErr } = await supabase
          .from('listings')
          .delete()
          .eq('user_id', userId);

        await loadSupabaseUsers();
        
        const { data: newListings } = await supabase
          .from('listings')
          .select('*')
          .order('created_at', { ascending: false });
        if (newListings) setBusinesses(newListings);

        return true;
      } catch (err) {
        console.error('Supabase profile deletion failed, applying simulated deletion', err);
      }
    }

    const storedUsersRaw = localStorage.getItem('mauritius_directory_mock_users') || '{}';
    let storedUsers: Record<string, string> = {};
    try {
      storedUsers = JSON.parse(storedUsersRaw);
    } catch (e) {
      storedUsers = {};
    }

    delete storedUsers[userEmailToDelete];
    localStorage.setItem('mauritius_directory_mock_users', JSON.stringify(storedUsers));

    const updatedListings = businesses.filter(b => b.user_id !== userEmailToDelete);
    setBusinesses(updatedListings);
    saveLocalBusinesses(updatedListings);

    loadLocalUsers();
    return true;
  };

  const handleAddUser = async (email: string, password?: string): Promise<boolean> => {
    const emailLower = email.trim().toLowerCase();
    
    if (!isLocalMode && supabase) {
      try {
        const { error } = await supabase
          .from('profiles')
          .insert({
            email: emailLower,
            is_admin: false,
            created_at: new Date().toISOString()
          });
        
        await loadSupabaseUsers();
        return true;
      } catch (err) {
        console.error('Failed to register user in Supabase profiles', err);
      }
    }

    const storedUsersRaw = localStorage.getItem('mauritius_directory_mock_users') || '{}';
    let storedUsers: Record<string, string> = {};
    try {
      storedUsers = JSON.parse(storedUsersRaw);
    } catch (e) {
      storedUsers = {};
    }

    if (storedUsers[emailLower]) {
      return false;
    }

    storedUsers[emailLower] = password || 'TemporarySecurePassword123!';
    localStorage.setItem('mauritius_directory_mock_users', JSON.stringify(storedUsers));

    loadLocalUsers();
    return true;
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
            onDeleteListing={handleDeleteListing}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPortal
            businesses={businesses}
            categories={categories}
            isLocalMode={isLocalMode}
            isAdmin={isAdmin}
            userEmail={userEmail}
            users={users}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            onAddUser={handleAddUser}
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

      {/* Password Reset Modal Overlay */}
      {isRecoveryMode && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50" id="password-reset-overlay">
          <div className="bg-white rounded-xl border border-stone-200 shadow-xl max-w-md w-full p-6 md:p-8 space-y-6" id="password-reset-modal">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-amber-50 border border-amber-200 text-amber-600 rounded-lg flex items-center justify-center mx-auto">
                <Sparkles className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-stone-900 tracking-tight">
                Secure Your Account
              </h2>
              <p className="text-xs text-stone-500 leading-relaxed">
                Please enter and confirm your new password below.
              </p>
            </div>

            {resetError && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-700 text-xs flex gap-2.5 items-start" id="reset-error-msg">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{resetError}</span>
              </div>
            )}

            {resetSuccess ? (
              <div className="space-y-4" id="reset-success-block">
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-800 text-xs flex gap-2.5 items-start">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
                  <div>
                    <p className="font-bold mb-1">Password Changed Successfully!</p>
                    <p className="leading-relaxed">Your password has been securely updated. You can now access your business listings.</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsRecoveryMode(false);
                    setNewPassword('');
                    setResetConfirmPassword('');
                    setResetSuccess(null);
                    // Clear hash from address bar
                    try {
                      window.history.replaceState(null, '', window.location.origin + window.location.pathname);
                    } catch (e) {
                      console.warn('Could not clean address bar:', e);
                    }
                  }}
                  className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-lg transition-colors text-sm"
                >
                  Continue to App
                </button>
              </div>
            ) : (
              <form onSubmit={handlePasswordResetSubmit} className="space-y-4" id="password-reset-form">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-600 block">New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Minimum 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-stone-50/50 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-500/10 focus:border-stone-500 transition-all placeholder:text-stone-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-600 block">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Re-enter new password"
                    value={resetConfirmPassword}
                    onChange={(e) => setResetConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-stone-50/50 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-500/10 focus:border-stone-500 transition-all placeholder:text-stone-400"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRecoveryMode(false);
                      // Clear hash
                      try {
                        window.history.replaceState(null, '', window.location.origin + window.location.pathname);
                      } catch (e) {}
                    }}
                    className="flex-1 py-2.5 border border-stone-200 hover:bg-stone-50 text-stone-600 font-semibold rounded-lg transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="flex-1 py-2.5 bg-stone-900 hover:bg-stone-850 disabled:bg-stone-400 text-white font-semibold rounded-lg transition-all text-sm flex items-center justify-center gap-2"
                  >
                    {resetLoading ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      'Update Password'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
