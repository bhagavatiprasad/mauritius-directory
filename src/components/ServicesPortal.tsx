import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Megaphone, 
  Code, 
  ShieldAlert, 
  Check, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Mail, 
  Phone, 
  Building, 
  MessageSquare, 
  Send, 
  FileText, 
  Search, 
  Globe, 
  Lock, 
  Settings, 
  Activity, 
  Database,
  ArrowUpRight
} from 'lucide-react';

interface ServicesPortalProps {
  userEmail: string | null;
  isLocalMode: boolean;
}

export default function ServicesPortal({ userEmail, isLocalMode }: ServicesPortalProps) {
  // Quote Builder State
  const [selectedServices, setSelectedServices] = useState<string[]>([
    'local-seo',
    'web-design'
  ]);
  const [companyName, setCompanyName] = useState('');
  const [contactEmail, setContactEmail] = useState(userEmail || '');
  const [contactPhone, setContactPhone] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pricing Model (Estimated Mauritian Rupees - MUR)
  const servicePricing: { [key: string]: { name: string; price: number; category: string } } = {
    'local-seo': { name: 'Local SEO Optmization', price: 6500, category: 'Marketing' },
    'content-writing': { name: 'Content & Copywriting', price: 4000, category: 'Marketing' },
    'google-ads': { name: 'Google Ads Campaigns', price: 8000, category: 'Marketing' },
    'social-ads': { name: 'Facebook & Instagram Ads', price: 7500, category: 'Marketing' },
    'influencer': { name: 'Influencer Outreach', price: 9000, category: 'Marketing' },
    'email-outreach': { name: 'Email Outreach Campaigns', price: 4500, category: 'Marketing' },
    'guest-post': { name: 'Guest Post Outreach', price: 6000, category: 'Marketing' },
    
    'web-design': { name: 'Custom Website Design', price: 15000, category: 'Development' },
    'web-dev': { name: 'Full Web Development', price: 25000, category: 'Development' },
    'web-hosting': { name: 'Premium Cloud Hosting', price: 1500, category: 'Development' },
    
    'vuln-check': { name: 'Vulnerability Audit & Fixes', price: 12000, category: 'Security' },
    'soc-service': { name: 'SOC Monitoring Service', price: 8500, category: 'Security' },
    'backup-maint': { name: 'Backup & Active Maintenance', price: 3000, category: 'Security' },
  };

  const handleToggleService = (id: string) => {
    if (selectedServices.includes(id)) {
      setSelectedServices(selectedServices.filter(s => s !== id));
    } else {
      setSelectedServices([...selectedServices, id]);
    }
  };

  // Base estimate and directory listing discount
  const rawTotal = selectedServices.reduce((sum, id) => sum + (servicePricing[id]?.price || 0), 0);
  const hasDiscount = true; // Every user viewing from the directory gets the directory promotional price!
  const discountRate = 0.20; // 20% off
  const finalTotal = hasDiscount ? rawTotal * (1 - discountRate) : rawTotal;

  const handleSubmitQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !contactEmail) {
      alert('Please fill out your Company Name and Contact Email.');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API storage or state saving
    setTimeout(() => {
      const newRequest = {
        id: 'req-' + Date.now(),
        companyName,
        contactEmail,
        contactPhone,
        whatsappNumber,
        selectedServices: selectedServices.map(id => servicePricing[id]?.name),
        estimatedPrice: finalTotal,
        notes: additionalNotes,
        submittedAt: new Date().toISOString(),
      };

      // Save to local storage for persistent lead tracking
      const existing = JSON.parse(localStorage.getItem('directory_service_quotes') || '[]');
      existing.push(newRequest);
      localStorage.setItem('directory_service_quotes', JSON.stringify(existing));

      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1200);
  };

  const resetForm = () => {
    setCompanyName('');
    setContactPhone('');
    setWhatsappNumber('');
    setAdditionalNotes('');
    setIsSubmitted(false);
  };

  return (
    <div className="space-y-16 py-4" id="services-portal">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-stone-50 via-stone-100 to-white border border-stone-200/60 rounded-3xl p-8 md:p-14 lg:p-16">
        <div className="absolute top-0 right-0 w-96 h-96 bg-stone-200/30 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-stone-100/50 rounded-full blur-2xl -ml-20 -mb-20 pointer-events-none"></div>

        <div className="relative max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 bg-stone-900 text-white px-3.5 py-1.5 rounded-full text-[11px] font-semibold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Digital Business Suite 2026</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-stone-900 tracking-tight leading-[1.1]">
            Scale Your Mauritian Business <br className="hidden md:inline" />
            <span className="text-stone-600 font-medium italic">With Premium IT Solutions</span>
          </h1>

          <p className="text-stone-600 text-base md:text-lg leading-relaxed max-w-2xl">
            We bridge the gap between local market intelligence and world-class technology. 
            From search visibility to bulletproof custom software engineering and secure servers, 
            our dedicated team powers the digital evolution of Mauritius' local enterprises.
          </p>

          <div className="flex flex-wrap gap-3.5 pt-2">
            <a 
              href="#quote-builder" 
              className="inline-flex items-center gap-2 bg-stone-950 text-white px-5 py-3 rounded-xl text-xs font-semibold hover:bg-stone-800 transition-all shadow-sm"
            >
              <span>Build Custom Package</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <a 
              href="#pillars" 
              className="inline-flex items-center gap-2 bg-white text-stone-700 border border-stone-200 hover:bg-stone-50 px-5 py-3 rounded-xl text-xs font-semibold transition-all"
            >
              <span>Explore Services</span>
            </a>
          </div>

          {/* Bullet Highlight Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-stone-200/80">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center text-[10px]">✓</div>
              <span className="text-xs font-medium text-stone-700">20% Off for Registered Members</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center text-[10px]">✓</div>
              <span className="text-xs font-medium text-stone-700">Dedicated Mauritian IP & Host</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center text-[10px]">✓</div>
              <span className="text-xs font-medium text-stone-700">SOC 24/7 Server Defense</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE THREE CORE PILLARS SECTION */}
      <section id="pillars" className="space-y-10">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <h2 className="text-2xl md:text-3xl font-bold text-stone-900 tracking-tight">Our Core Service Offerings</h2>
          <p className="text-xs md:text-sm text-stone-500">
            Integrated technology solutions designed to capture leads, construct high-performance apps, and defend corporate websites from external vulnerabilities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* PILLAR 1: DIGITAL MARKETING */}
          <motion.div 
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="bg-white border border-stone-200/70 rounded-2xl p-6 md:p-8 space-y-6 flex flex-col justify-between shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-stone-400 to-stone-600"></div>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-stone-950 border border-stone-200">
                <Megaphone className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-stone-900">1. Digital Marketing</h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Maximize your brand presence, attract local customers, and dominate web search engine results.
                </p>
              </div>
              
              <ul className="space-y-2.5 pt-2">
                {[
                  { title: 'Local SEO', desc: 'Optimize map placements & directory authority' },
                  { title: 'Content Writing', desc: 'Engaging, SEO-optimized business copywriting' },
                  { title: 'Google Ads', desc: 'Targeted pay-per-click search query campaigns' },
                  { title: 'Facebook & Instagram Ads', desc: 'High-converting social visual funnels' },
                  { title: 'Influencer Outreach', desc: 'Partner with local Mauritian brand voices' },
                  { title: 'Email Outreach', desc: 'High-touch personalized email campaigns' },
                  { title: 'Guest Post Outreach', desc: 'Acquire authoritative backlink relationships' },
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-2.5 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-stone-800 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-stone-800">{item.title}</span>
                      <p className="text-[11px] text-stone-400">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="pt-6 border-t border-stone-100 mt-6">
              <a href="#quote-builder" className="text-xs font-bold text-stone-900 hover:text-stone-700 inline-flex items-center gap-1.5">
                <span>Select marketing services</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </motion.div>

          {/* PILLAR 2: WEBSITE DEVELOPMENT */}
          <motion.div 
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="bg-white border border-stone-200/70 rounded-2xl p-6 md:p-8 space-y-6 flex flex-col justify-between shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-stone-600 to-stone-900"></div>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-stone-950 border border-stone-200">
                <Code className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-stone-900">2. Website Development</h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Bespoke, blazing-fast web designs built with modern frameworks for exceptional customer conversion.
                </p>
              </div>
              
              <ul className="space-y-2.5 pt-2">
                {[
                  { title: 'Website Designing', desc: 'Custom UX/UI tailored for desktop & mobile devices' },
                  { title: 'Website Development', desc: 'React, Next.js or WordPress high-performance pages' },
                  { title: 'Website Hosting', desc: 'Lightning-fast cloud networks with CDN edge caching' },
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-2.5 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-stone-800 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-stone-800">{item.title}</span>
                      <p className="text-[11px] text-stone-400">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Extra technical showcase */}
              <div className="bg-stone-50 border border-stone-200/50 rounded-xl p-3.5 mt-4">
                <h4 className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1.5">Stack Standards</h4>
                <div className="flex flex-wrap gap-1.5">
                  {['React & Vite', 'NextJS', 'TailwindCSS', 'NodeJS', 'Supabase Cloud', 'AWS Edge'].map((s, i) => (
                    <span key={i} className="text-[9px] font-semibold bg-white border border-stone-200 text-stone-600 px-2 py-0.5 rounded-md">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="pt-6 border-t border-stone-100 mt-6">
              <a href="#quote-builder" className="text-xs font-bold text-stone-900 hover:text-stone-700 inline-flex items-center gap-1.5">
                <span>Configure web project</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </motion.div>

          {/* PILLAR 3: WEBSITE SECURITY & MAINTENANCE */}
          <motion.div 
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="bg-white border border-stone-200/70 rounded-2xl p-6 md:p-8 space-y-6 flex flex-col justify-between shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-stone-950 to-stone-800"></div>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-stone-950 border border-stone-200">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-stone-900">3. Security & Maintenance</h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Proactive system monitoring, defense protocols, and active maintenance to keep your software safe.
                </p>
              </div>
              
              <ul className="space-y-2.5 pt-2">
                {[
                  { title: 'Vulnerability Checking & Fixing', desc: 'Identify script risks, server loopholes & code bugs' },
                  { title: 'SOC Service Providing', desc: 'Active security operations monitoring & alert systems' },
                  { title: 'Website Backup & Maintenance', desc: 'Daily automated cloud snapshots & routine patch updates' },
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-2.5 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-stone-800 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-stone-800">{item.title}</span>
                      <p className="text-[11px] text-stone-400">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="pt-6 border-t border-stone-100 mt-6">
              <a href="#quote-builder" className="text-xs font-bold text-stone-900 hover:text-stone-700 inline-flex items-center gap-1.5">
                <span>Review security solutions</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </motion.div>

        </div>
      </section>

      {/* 3. BUSINESS SYNERGY / THE PROPOSAL MECHANISM */}
      <section className="bg-stone-950 text-white rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-stone-800/40 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative">
          
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-amber-400">
              <Building className="w-3 h-3" />
              <span>Platform-Exclusive Synergy Model</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Why List Your Business On Directory.mu?
            </h2>
            <p className="text-stone-300 text-xs md:text-sm leading-relaxed">
              When business owners register on our local business registry, they unlock a combined service loop. 
              By checking the permission box during listing configuration, you grant us permission to analyze your 
              digital presence. In exchange, you instantly unlock:
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex gap-2 text-xs">
                <span className="text-amber-400 font-bold">1.</span>
                <div>
                  <h4 className="font-bold text-stone-100">Complimentary IT Audit</h4>
                  <p className="text-stone-400 text-[11px]">Free vulnerability scanner & SEO diagnostics on your current site.</p>
                </div>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="text-amber-400 font-bold">2.</span>
                <div>
                  <h4 className="font-bold text-stone-100">20% Promotional Discount</h4>
                  <p className="text-stone-400 text-[11px]">Substantial price deduction across our entire IT service catalog.</p>
                </div>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="text-amber-400 font-bold">3.</span>
                <div>
                  <h4 className="font-bold text-stone-100">Lead Generation Loop</h4>
                  <p className="text-stone-400 text-[11px]">Cross-promote your services directly to other directory stakeholders.</p>
                </div>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="text-amber-400 font-bold">4.</span>
                <div>
                  <h4 className="font-bold text-stone-100">Priority SEO Backlinks</h4>
                  <p className="text-stone-400 text-[11px]">Direct high-authority link signals straight to your web assets.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-stone-800 pb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Marketing Data Permission Loop</span>
            </h3>
            
            <p className="text-xs text-stone-400 leading-relaxed">
              Upon directory signup, selecting the "promotional offer outreach consent" grants written permission to suggest 
              personalized SEO improvements, custom marketing funnels, and hosting upgrades. No spam—only tailored tech solutions.
            </p>
            
            <div className="bg-stone-950/80 border border-stone-800/70 rounded-xl p-3 text-[11px] text-stone-300 space-y-2">
              <p className="font-semibold text-stone-100">How to claim your 20% discount:</p>
              <ol className="list-decimal list-inside space-y-1 text-stone-400">
                <li>Submit a listing on Directory.mu</li>
                <li>Navigate to the "Services" tab</li>
                <li>Check your desired IT solutions below</li>
                <li>Submit your quote request</li>
              </ol>
            </div>
          </div>

        </div>
      </section>

      {/* 4. INTERACTIVE COST ESTIMATOR & QUOTE REQUEST */}
      <section id="quote-builder" className="bg-white border border-stone-200 rounded-3xl p-6 md:p-10 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          
          {/* Left Column: Selectors */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-stone-900">1. Build Your IT Service Bundle</h3>
              <p className="text-xs text-stone-500">
                Toggle specific solutions to customize your enterprise bundle. Your estimated costs and promotional discount are computed live below.
              </p>
            </div>

            {/* Service Categories */}
            {['Marketing', 'Development', 'Security'].map((cat) => {
              const items = Object.entries(servicePricing).filter(([_, info]) => info.category === cat);
              return (
                <div key={cat} className="space-y-3">
                  <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider border-b border-stone-100 pb-1">{cat} Solutions</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {items.map(([id, info]) => {
                      const isChecked = selectedServices.includes(id);
                      return (
                        <div 
                          key={id} 
                          onClick={() => handleToggleService(id)}
                          className={`border p-3.5 rounded-xl cursor-pointer transition-all flex items-start gap-3 select-none ${
                            isChecked 
                              ? 'bg-stone-50 border-stone-900 ring-1 ring-stone-900' 
                              : 'bg-white border-stone-200 hover:border-stone-400'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border ${
                            isChecked ? 'bg-stone-900 border-stone-900 text-white' : 'border-stone-300 bg-white'
                          }`}>
                            {isChecked && <Check className="w-3 h-3" />}
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-stone-900 block">{info.name}</span>
                            <span className="text-[11px] text-stone-500 font-mono">
                              {info.price >= 1000 ? `${info.price.toLocaleString()} MUR` : `${info.price} MUR/mo`}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Interactive Quote Computation & Form */}
          <div className="lg:col-span-5 bg-stone-50 border border-stone-200/80 rounded-2xl p-6 flex flex-col justify-between">
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-widest border-b border-stone-200 pb-3">
                Live Pricing Estimate
              </h3>

              {/* Service list overview */}
              <div className="space-y-2">
                {selectedServices.length === 0 ? (
                  <p className="text-xs text-stone-400 italic py-4 text-center">No services selected. Choose some options from the left.</p>
                ) : (
                  <div className="max-h-40 overflow-y-auto pr-1 space-y-1.5">
                    {selectedServices.map(id => {
                      const item = servicePricing[id];
                      return (
                        <div key={id} className="flex justify-between items-center text-xs">
                          <span className="text-stone-600 font-medium">{item.name}</span>
                          <span className="text-stone-900 font-mono text-[11px]">{item.price.toLocaleString()} MUR</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Summary calculations */}
              <div className="border-t border-stone-200 pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-stone-500">
                  <span>Subtotal:</span>
                  <span className="font-mono">{rawTotal.toLocaleString()} MUR</span>
                </div>
                
                {hasDiscount && (
                  <div className="flex justify-between text-amber-600 font-semibold">
                    <span className="flex items-center gap-1">
                      <span>Directory Member Benefit (-20%):</span>
                    </span>
                    <span className="font-mono">-{Math.round(rawTotal * discountRate).toLocaleString()} MUR</span>
                  </div>
                )}

                <div className="flex justify-between text-stone-900 font-bold text-sm pt-2 border-t border-dashed border-stone-200">
                  <span>Estimated Total:</span>
                  <span className="font-mono text-base">{Math.round(finalTotal).toLocaleString()} MUR</span>
                </div>
                <p className="text-[10px] text-stone-400 leading-tight italic">
                  *This estimate provides an initial proposal. Final rates are locked upon structural scope verification.
                </p>
              </div>

              {/* Submission Form */}
              <AnimatePresence mode="wait">
                {!isSubmitted ? (
                  <form onSubmit={handleSubmitQuote} className="space-y-3 pt-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-stone-600 uppercase">Company Name *</label>
                      <div className="relative">
                        <Building className="absolute left-3 top-2.5 h-3.5 w-3.5 text-stone-400" />
                        <input 
                          type="text" 
                          required
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="e.g. Mauritius Coral Tours"
                          className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:ring-1 focus:ring-stone-900 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-stone-600 uppercase">Contact Email *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-stone-400" />
                        <input 
                          type="email" 
                          required
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="e.g. contact@yourcompany.com"
                          className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:ring-1 focus:ring-stone-900 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-stone-600 uppercase">Phone Number</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-stone-400" />
                          <input 
                            type="text" 
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                            placeholder="e.g. 5123 4567"
                            className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:ring-1 focus:ring-stone-900 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-stone-600 uppercase">WhatsApp</label>
                        <div className="relative">
                          <MessageSquare className="absolute left-3 top-2.5 h-3.5 w-3.5 text-stone-400" />
                          <input 
                            type="text" 
                            value={whatsappNumber}
                            onChange={(e) => setWhatsappNumber(e.target.value)}
                            placeholder="e.g. +230 5123..."
                            className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:ring-1 focus:ring-stone-900 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-stone-600 uppercase">Special Requirements</label>
                      <textarea 
                        rows={2}
                        value={additionalNotes}
                        onChange={(e) => setAdditionalNotes(e.target.value)}
                        placeholder="e.g. Need urgent e-commerce design or quick penetration scan."
                        className="w-full bg-white border border-stone-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-stone-900 focus:outline-none resize-none"
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={isSubmitting || selectedServices.length === 0}
                      className="w-full bg-stone-950 text-white rounded-xl py-3 text-xs font-semibold hover:bg-stone-800 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-stone-400 border-t-white rounded-full animate-spin"></div>
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Quote Request</span>
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-5 text-center space-y-4 pt-6"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-500 text-white mx-auto flex items-center justify-center shadow-sm">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-stone-900">Proposal Request Received!</h4>
                      <p className="text-[11px] text-stone-600 leading-relaxed">
                        Thank you! We have received your preliminary specifications. A local Mauritian IT specialist will compile your customized audit and contact you via email or WhatsApp within 24 hours.
                      </p>
                    </div>

                    <button 
                      onClick={resetForm}
                      className="text-xs bg-white text-stone-700 border border-stone-200 px-3.5 py-1.5 rounded-lg hover:bg-stone-50 transition-all font-medium inline-block cursor-pointer"
                    >
                      Build Another Quote
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>

        </div>
      </section>

      {/* 5. HISTORIC LEADS / SUBMISSIONS TRACE (IF ANY LOCAL QUOTES EXIST) */}
      <ServiceQuoteLeads />
    </div>
  );
}

// Inner helper component to show saved lead cards locally
function ServiceQuoteLeads() {
  const [quotes, setQuotes] = React.useState<any[]>(() => {
    return JSON.parse(localStorage.getItem('directory_service_quotes') || '[]');
  });

  const clearQuotes = () => {
    if (confirm('Are you sure you want to clear your local quote history?')) {
      localStorage.removeItem('directory_service_quotes');
      setQuotes([]);
    }
  };

  if (quotes.length === 0) return null;

  return (
    <section className="bg-stone-50 border border-stone-200/60 rounded-2xl p-6 space-y-4">
      <div className="flex justify-between items-center border-b border-stone-200 pb-3">
        <div>
          <h4 className="text-sm font-bold text-stone-900">Your Quote Requests Tracker</h4>
          <p className="text-[11px] text-stone-500">Local record of requested IT services and progress indicators.</p>
        </div>
        <button 
          onClick={clearQuotes}
          className="text-[10px] font-bold text-stone-400 hover:text-stone-600 transition-all underline"
        >
          Clear History
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quotes.map((q, idx) => (
          <div key={idx} className="bg-white border border-stone-200/80 rounded-xl p-4 space-y-3 text-xs shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h5 className="font-bold text-stone-900">{q.companyName}</h5>
                <span className="text-[10px] text-stone-400 font-mono">ID: {q.id}</span>
              </div>
              <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase">
                Under Review
              </span>
            </div>

            <div className="space-y-1">
              <p className="font-semibold text-stone-700">Services Requested:</p>
              <div className="flex flex-wrap gap-1">
                {q.selectedServices?.map((srv: string, i: number) => (
                  <span key={i} className="text-[9px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded border border-stone-200">
                    {srv}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center text-[11px] border-t border-stone-100 pt-2.5">
              <span className="text-stone-500">Estimated Total: <strong className="text-stone-900 font-mono">{Math.round(q.estimatedPrice).toLocaleString()} MUR</strong></span>
              <span className="text-stone-400 text-[9px] font-mono">{new Date(q.submittedAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
