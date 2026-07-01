import React, { useState } from 'react';
import { Business, Category, MAURITIUS_DISTRICTS } from '../types';
import { 
  Search, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Clock, 
  Tag, 
  Eye, 
  SlidersHorizontal,
  Utensils,
  Hotel,
  ShoppingBag,
  Briefcase,
  HeartPulse,
  Compass,
  Sparkles,
  Car,
  HelpCircle,
  X
} from 'lucide-react';

interface DirectoryPortalProps {
  businesses: Business[];
  categories: Category[];
  isLocalMode: boolean;
  onSelectBusiness?: (business: Business) => void;
}

// Icon mapper for categories based on the database key string
export function getCategoryIcon(iconName: string | undefined) {
  switch (iconName) {
    case 'Utensils': return <Utensils className="w-5 h-5" />;
    case 'Hotel': return <Hotel className="w-5 h-5" />;
    case 'ShoppingBag': return <ShoppingBag className="w-5 h-5" />;
    case 'Briefcase': return <Briefcase className="w-5 h-5" />;
    case 'HeartPulse': return <HeartPulse className="w-5 h-5" />;
    case 'Compass': return <Compass className="w-5 h-5" />;
    case 'Sparkles': return <Sparkles className="w-5 h-5" />;
    case 'Car': return <Car className="w-5 h-5" />;
    default: return <HelpCircle className="w-5 h-5" />;
  }
}

export default function DirectoryPortal({ businesses, categories, isLocalMode }: DirectoryPortalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [activeDetailBusiness, setActiveDetailBusiness] = useState<Business | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter logic: Only approved businesses are shown on the public directory
  const approvedBusinesses = businesses.filter(b => b.status === 'approved');

  const filteredBusinesses = approvedBusinesses.filter(biz => {
    const matchesSearch = biz.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          biz.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          biz.phone.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? biz.category_id === selectedCategory : true;
    const matchesDistrict = selectedDistrict ? biz.district === selectedDistrict : true;
    return matchesSearch && matchesCategory && matchesDistrict;
  });

  const getCategoryName = (catId: string) => {
    return categories.find(c => c.id === catId)?.name || 'Local Business';
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedDistrict(null);
  };

  return (
    <div className="space-y-8" id="public-directory-root">
      {/* Hero Banner with Centered Search Bar - Clean Minimalism */}
      <div className="relative rounded-2xl bg-stone-50 p-8 md:p-12 text-center border border-stone-200/60 shadow-xs">
        <div className="relative z-10 max-w-2xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-1.5 bg-stone-200/50 border border-stone-300/40 px-3 py-1 rounded-full text-stone-700 text-xs font-medium tracking-tight">
            Explore Mauritian Commerce
          </div>
          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-stone-900 leading-tight">
            Discover Exceptional <span className="text-stone-700 underline decoration-stone-300 decoration-wavy">Local Businesses</span>
          </h1>
          <p className="text-stone-500 text-xs md:text-sm max-w-lg mx-auto leading-relaxed">
            Find the finest dining, accommodations, and professional services across all 9 districts of Mauritius.
          </p>

          {/* Centered Search Bar */}
          <div className="flex flex-col sm:flex-row gap-2 bg-white p-1.5 rounded-xl border border-stone-200 shadow-xs mt-6">
            <div className="flex-1 flex items-center gap-2.5 px-3 py-2 bg-stone-50/50 rounded-lg border border-stone-100">
              <Search className="w-4 h-4 text-stone-400 shrink-0" />
              <input
                type="text"
                placeholder="Search businesses by name, address, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-stone-850 placeholder-stone-400 focus:outline-none text-xs"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="text-stone-500 hover:text-stone-800 text-[10px] px-1.5 py-0.5 rounded bg-stone-100"
                >
                  Clear
                </button>
              )}
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded-lg transition-colors shrink-0"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-stone-300" />
              <span>Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Drawer/Panel Filters */}
      {(showFilters || selectedCategory || selectedDistrict) && (
        <div className="bg-stone-50 border border-stone-200/60 p-5 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-stone-800 text-xs flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-stone-500" />
              Refine Your Directory Search
            </h3>
            <button 
              onClick={handleResetFilters}
              className="text-[11px] text-stone-600 hover:text-stone-900 underline font-medium"
            >
              Reset All Filters
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Filter by Category */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-stone-500 block">Select Category</label>
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
                className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-700 focus:outline-none focus:ring-1 focus:ring-stone-300"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Filter by District */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-stone-500 block">Select District (Mauritius)</label>
              <select
                value={selectedDistrict || ''}
                onChange={(e) => setSelectedDistrict(e.target.value || null)}
                className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-700 focus:outline-none focus:ring-1 focus:ring-stone-300"
              >
                <option value="">All Districts</option>
                {MAURITIUS_DISTRICTS.map(dist => (
                  <option key={dist} value={dist}>{dist}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Categories Horizontal Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-stone-850 uppercase tracking-wider">Browse by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {categories.filter(c => !c.archived).map(cat => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  isSelected 
                    ? 'bg-stone-900 border-stone-900 text-white shadow-xs' 
                    : 'bg-white border-stone-200/60 hover:border-stone-300 hover:bg-stone-50/50 text-stone-700'
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 transition-colors ${
                  isSelected ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-500'
                }`}>
                  {getCategoryIcon(cat.icon)}
                </div>
                <span className="text-xs font-medium leading-snug line-clamp-2">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Directory Listings Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h2 className="text-sm font-semibold text-stone-850 uppercase tracking-wider">
            Approved Listings ({filteredBusinesses.length})
          </h2>
          <span className="text-[10px] text-stone-400 font-medium">
            Mauritius Standardized Directory Portal
          </span>
        </div>

        {filteredBusinesses.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-stone-200 p-12 text-center max-w-md mx-auto space-y-4">
            <div className="w-10 h-10 bg-stone-50 text-stone-400 rounded-full flex items-center justify-center mx-auto border border-stone-100">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-850 text-sm">No Listings Found</h3>
              <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto leading-relaxed">
                No approved business matched your current keyword or category selections. Try resetting the filters.
              </p>
            </div>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-stone-950 hover:bg-stone-850 text-white text-xs font-medium rounded-lg transition-colors"
            >
              Clear Search & Filters
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBusinesses.map(biz => (
              <div 
                key={biz.id} 
                className="group bg-white rounded-xl border border-stone-200/60 shadow-xs hover:border-stone-400 transition-all duration-300 overflow-hidden flex flex-col h-full"
              >
                {/* Image Showcase */}
                <div className="relative h-44 w-full bg-stone-50 overflow-hidden shrink-0 border-b border-stone-100">
                  <img
                    src={biz.image_url || 'https://images.unsplash.com/photo-1546213290-e1b764f24307?auto=format&fit=crop&w=600&q=80'}
                    alt={biz.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-white/95 px-2.5 py-1 rounded-md border border-stone-200 text-[10px] font-bold text-stone-800 flex items-center gap-1 shadow-xs">
                    <MapPin className="w-3 h-3 text-stone-500" />
                    <span>{biz.district}</span>
                  </div>
                </div>

                {/* Content Block */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-stone-500 tracking-wider uppercase">
                      <Tag className="w-3 h-3" />
                      <span>{getCategoryName(biz.category_id)}</span>
                    </div>
                    <h3 className="font-semibold text-stone-900 group-hover:text-stone-750 transition-colors line-clamp-1">
                      {biz.name}
                    </h3>
                    <p className="text-xs text-stone-500 line-clamp-2 min-h-[2rem] leading-relaxed">
                      {biz.address}
                    </p>
                  </div>

                  {/* Detail actions */}
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-[10px] text-stone-400 font-medium">
                      Verified Listing
                    </span>
                    <button
                      onClick={() => setActiveDetailBusiness(biz)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold rounded-lg transition-colors border border-stone-200"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View details</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Listing Details Modal Popup */}
      {activeDetailBusiness && (
        <div className="fixed inset-0 bg-stone-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl border border-stone-200 shadow-xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Header Section */}
            <div className="relative h-56 w-full bg-stone-50 shrink-0">
              <img
                src={activeDetailBusiness.image_url || 'https://images.unsplash.com/photo-1546213290-e1b764f24307?auto=format&fit=crop&w=600&q=80'}
                alt={activeDetailBusiness.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setActiveDetailBusiness(null)}
                className="absolute top-3 right-3 bg-stone-900/70 hover:bg-stone-900/90 text-white p-1.5 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-3 bg-stone-900 text-stone-100 border border-stone-800 px-2.5 py-1 rounded text-[10px] font-medium shadow-xs">
                {getCategoryName(activeDetailBusiness.category_id)}
              </div>
            </div>

            {/* Details Grid (Scrollable if overflow) */}
            <div className="p-6 overflow-y-auto space-y-5">
              <div>
                <h3 className="text-lg font-semibold text-stone-900 tracking-tight">
                  {activeDetailBusiness.name}
                </h3>
                <div className="flex items-center gap-1 text-xs text-stone-500 mt-1">
                  <MapPin className="w-4 h-4 text-stone-400 shrink-0" />
                  <span>{activeDetailBusiness.address}, {activeDetailBusiness.district}</span>
                </div>
              </div>

              <div className="space-y-3.5 border-t border-b border-stone-100 py-4 text-xs text-stone-600">
                {/* Hours */}
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-stone-800">Opening Hours</h5>
                    <p className="text-stone-500 mt-0.5">{activeDetailBusiness.hours || 'Contact for details'}</p>
                  </div>
                </div>

                {/* Telephone */}
                {activeDetailBusiness.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-semibold text-stone-800">Telephone</h5>
                      <a 
                        href={`tel:${activeDetailBusiness.phone.replace(/\s+/g, '')}`} 
                        className="text-stone-750 hover:underline font-medium mt-0.5 block"
                      >
                        {activeDetailBusiness.phone}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Contact Triggers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                {activeDetailBusiness.whatsapp && (
                  <a
                    href={`https://wa.me/${activeDetailBusiness.whatsapp.replace(/\+/g, '').replace(/\s+/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 shrink-0" />
                    <span>Chat on WhatsApp</span>
                  </a>
                )}
                {activeDetailBusiness.phone && (
                  <a
                    href={`tel:${activeDetailBusiness.phone.replace(/\s+/g, '')}`}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-semibold rounded-lg transition-colors border border-stone-200"
                  >
                    <Phone className="w-4 h-4 shrink-0" />
                    <span>Call Business</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
