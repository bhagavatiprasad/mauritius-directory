export type BusinessStatus = 'pending' | 'approved' | 'rejected';

export interface Business {
  id: string;
  user_id: string;
  name: string;
  category_id: string;
  district: string;
  address: string;
  phone: string;
  whatsapp: string;
  hours: string;
  image_url: string;
  status: BusinessStatus;
  featured?: boolean;
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string; // Lucide icon key
  archived?: boolean;
}

export interface Profile {
  id: string;
  is_admin: boolean;
  email?: string;
}

export interface UserAccount {
  id: string;
  email: string;
  is_admin: boolean;
  created_at?: string;
  password?: string;
}

export const MAURITIUS_DISTRICTS = [
  'Port Louis',
  'Plaines Wilhems',
  'Flacq',
  'Grand Port',
  'Moka',
  'Pamplemousses',
  'Rivière du Rempart',
  'Rivière Noire',
  'Savanne'
] as const;

export type District = typeof MAURITIUS_DISTRICTS[number];
