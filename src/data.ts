import { Business, Category } from './types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-dining', name: 'Restaurants & Dining', icon: 'Utensils', archived: false },
  { id: 'cat-hotels', name: 'Hotels & Accommodation', icon: 'Hotel', archived: false },
  { id: 'cat-shopping', name: 'Retail & Shopping', icon: 'ShoppingBag', archived: false },
  { id: 'cat-services', name: 'Professional Services', icon: 'Briefcase', archived: false },
  { id: 'cat-wellness', name: 'Health & Wellness', icon: 'HeartPulse', archived: false },
  { id: 'cat-activities', name: 'Activities & Adventure', icon: 'Compass', archived: false },
  { id: 'cat-beauty', name: 'Beauty & Spas', icon: 'Sparkles', archived: false },
  { id: 'cat-automotive', name: 'Automotive & Repairs', icon: 'Car', archived: false }
];

export const INITIAL_BUSINESSES: Business[] = [
  {
    id: 'biz-1',
    user_id: 'user-mock-1',
    name: 'Le Capitaine Restaurant',
    category_id: 'cat-dining',
    district: 'Rivière du Rempart',
    address: 'Royal Road, Grand Baie',
    phone: '+230 263 6859',
    whatsapp: '23058888888',
    hours: 'Monday - Sunday: 12:00 PM - 10:30 PM',
    image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
    status: 'approved'
  },
  {
    id: 'biz-2',
    user_id: 'user-mock-2',
    name: 'Lakaz Chamarel Exclusive Lodge',
    category_id: 'cat-hotels',
    district: 'Savanne',
    address: 'Pitot Road, Chamarel',
    phone: '+230 483 4240',
    whatsapp: '23057777777',
    hours: 'Monday - Sunday: 24 Hours',
    image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
    status: 'approved'
  },
  {
    id: 'biz-3',
    user_id: 'user-mock-3',
    name: 'Bagatelle Mall - Fashion Hub',
    category_id: 'cat-shopping',
    district: 'Moka',
    address: 'Bagatelle, Moka',
    phone: '+230 468 8550',
    whatsapp: '23056666666',
    hours: 'Monday - Saturday: 9:30 AM - 8:30 PM, Sunday: 9:30 AM - 3:00 PM',
    image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80',
    status: 'approved'
  },
  {
    id: 'biz-4',
    user_id: 'user-mock-4',
    name: 'Flic en Flac Scuba Diving Club',
    category_id: 'cat-activities',
    district: 'Rivière Noire',
    address: 'Coastal Road, Flic en Flac',
    phone: '+230 453 8450',
    whatsapp: '23055555555',
    hours: 'Monday - Saturday: 8:00 AM - 4:00 PM, Sunday: Closed',
    image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80',
    status: 'approved'
  },
  {
    id: 'biz-5',
    user_id: 'user-mock-5',
    name: 'Port Louis Central Market Organic Spices',
    category_id: 'cat-shopping',
    district: 'Port Louis',
    address: 'Corderie Street, Port Louis',
    phone: '+230 212 0012',
    whatsapp: '23054444444',
    hours: 'Monday - Saturday: 6:00 AM - 6:00 PM, Sunday: 6:00 AM - 12:00 PM',
    image_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
    status: 'approved'
  },
  {
    id: 'biz-6',
    user_id: 'user-mock-6',
    name: 'Belle Mare Watersports Adventure',
    category_id: 'cat-activities',
    district: 'Flacq',
    address: 'Public Beach Coastal Road, Belle Mare',
    phone: '+230 415 1515',
    whatsapp: '23053333333',
    hours: 'Monday - Sunday: 9:00 AM - 5:00 PM',
    image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    status: 'approved'
  },
  {
    id: 'biz-pending-1',
    user_id: 'user-mock-7',
    name: 'Tamarin Surf Academy',
    category_id: 'cat-activities',
    district: 'Rivière Noire',
    address: 'Tamarin Beach, Tamarin',
    phone: '+230 483 1111',
    whatsapp: '23052222222',
    hours: 'Monday - Saturday: 7:00 AM - 5:00 PM',
    image_url: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=600&q=80',
    status: 'pending'
  }
];

// Helper functions for local state management (fallback mode)
export const getLocalBusinesses = (): Business[] => {
  const stored = localStorage.getItem('mauritius_directory_businesses');
  if (!stored) {
    localStorage.setItem('mauritius_directory_businesses', JSON.stringify(INITIAL_BUSINESSES));
    return INITIAL_BUSINESSES;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return INITIAL_BUSINESSES;
  }
};

export const saveLocalBusinesses = (businesses: Business[]) => {
  localStorage.setItem('mauritius_directory_businesses', JSON.stringify(businesses));
};

export const getLocalCategories = (): Category[] => {
  const stored = localStorage.getItem('mauritius_directory_categories');
  if (!stored) {
    localStorage.setItem('mauritius_directory_categories', JSON.stringify(INITIAL_CATEGORIES));
    return INITIAL_CATEGORIES;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return INITIAL_CATEGORIES;
  }
};

export const saveLocalCategories = (categories: Category[]) => {
  localStorage.setItem('mauritius_directory_categories', JSON.stringify(categories));
};
