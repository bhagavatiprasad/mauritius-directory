import React from 'react';
import { motion } from 'motion/react';
import { 
  Megaphone, 
  Code, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Mail, 
  MessageSquare, 
  Building, 
  ArrowUpRight,
  Send,
  ExternalLink,
  ShieldCheck,
  Zap,
  Check
} from 'lucide-react';

interface ServicesPortalProps {
  userEmail: string | null;
  isLocalMode: boolean;
}

export default function ServicesPortal({ userEmail, isLocalMode }: ServicesPortalProps) {
  return (
    <div className="space-y-16 py-4" id="services-portal">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-stone-50 via-stone-100 to-white border border-stone-200/60 rounded-3xl p-8 md:p-14 lg:p-16">
        <div className="absolute top-0 right-0 w-96 h-96 bg-stone-200/30 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-stone-100/50 rounded-full blur-2xl -ml-20 -mb-20 pointer-events-none"></div>

        <div className="relative max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 bg-stone-900 text-white px-3.5 py-1.5 rounded-full text-[11px] font-semibold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
            <span>Premium IT & Marketing Suite</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-stone-900 tracking-tight leading-[1.1]">
            Scale Your Mauritian Business <br className="hidden md:inline" />
            <span className="text-stone-600 font-medium italic">With World-Class Technology</span>
          </h1>

          <p className="text-stone-600 text-base md:text-lg leading-relaxed max-w-2xl">
            We bridge the gap between local Mauritian market intelligence and world-class digital solutions. 
            From organic search rankings to beautiful custom software development and 24/7 server security operations, 
            our specialized team handles your engineering and marketing demands end-to-end.
          </p>

          <div className="flex flex-wrap gap-3.5 pt-2">
            <a 
              href="mailto:hello.bhagavati@gmail.com?subject=IT Services & Digital Marketing Consultation" 
              className="inline-flex items-center gap-2 bg-stone-950 text-white px-6 py-3 rounded-xl text-xs font-semibold hover:bg-stone-800 transition-all shadow-sm"
            >
              <Mail className="w-4 h-4 text-stone-300" />
              <span>Contact Us Directly</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <a 
              href="#pillars" 
              className="inline-flex items-center gap-2 bg-white text-stone-700 border border-stone-200 hover:bg-stone-50 px-5 py-3 rounded-xl text-xs font-semibold transition-all"
            >
              <span>Explore Services Catalog</span>
            </a>
          </div>

          {/* Core Trust Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-stone-200/80">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center text-[10px]">✓</div>
              <span className="text-xs font-medium text-stone-700">Dedicated local strategy</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center text-[10px]">✓</div>
              <span className="text-xs font-medium text-stone-700">99.9% Cloud infrastructure</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center text-[10px]">✓</div>
              <span className="text-xs font-medium text-stone-700">Active vulnerability shielding</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE THREE CORE PILLARS SECTION */}
      <section id="pillars" className="space-y-10">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <h2 className="text-2xl md:text-3xl font-bold text-stone-900 tracking-tight">Enterprise IT & Marketing Services</h2>
          <p className="text-xs md:text-sm text-stone-500 leading-relaxed">
            High-performance digital solutions custom-tailored to acquire leads, build stunning web portals, and protect enterprise networks from cyber vulnerabilities.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* PILLAR 1: DIGITAL MARKETING */}
          <div className="bg-white border border-stone-200/70 rounded-2xl p-6 md:p-8 space-y-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-stone-400 to-stone-600"></div>
            <div className="space-y-5">
              <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-stone-950 border border-stone-200">
                <Megaphone className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-stone-900">1. Digital Marketing</h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Maximize your brand presence, capture local market share, and dominate organic search engines.
                </p>
              </div>
              
              <ul className="space-y-3.5 pt-2 border-t border-stone-100">
                {[
                  { title: 'Local SEO', desc: 'Dominate map rankings and district-level directories.' },
                  { title: 'Content Writing', desc: 'SEO-optimized, persuasive, and custom-written business copywriting.' },
                  { title: 'Google Ads', desc: 'Precision pay-per-click search campaigns targeting active search intents.' },
                  { title: 'Facebook & Instagram Ads', desc: 'High-converting visual funnels targeting demographic cohorts.' },
                  { title: 'Influencer Outreach', desc: 'Partnering with trusted local Mauritian brand advocates.' },
                  { title: 'Email Outreach', desc: 'High-touch, personalized outbound sales sequences.' },
                  { title: 'Guest Post Outreach', desc: 'Acquiring high-authority digital editorial backlinks.' },
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-2.5 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-stone-800 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-stone-800 block">{item.title}</span>
                      <span className="text-[11px] text-stone-400 leading-normal block">{item.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* PILLAR 2: WEBSITE DEVELOPMENT */}
          <div className="bg-white border border-stone-200/70 rounded-2xl p-6 md:p-8 space-y-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-stone-600 to-stone-900"></div>
            <div className="space-y-5">
              <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-stone-950 border border-stone-200">
                <Code className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-stone-900">2. Website Development</h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Bespoke, high-performance web applications built from scratch for seamless user experiences.
                </p>
              </div>
              
              <ul className="space-y-3.5 pt-2 border-t border-stone-100">
                {[
                  { title: 'Website Designing', desc: 'Clean UI/UX designs focused heavily on device-responsiveness and conversion rates.' },
                  { title: 'Website Development', desc: 'Custom, secure web portals built using React, Vite, Node, and Tailwind CSS.' },
                  { title: 'Website Hosting', desc: 'Super-fast cloud hosting backed by localized Content Delivery Networks (CDNs).' },
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-2.5 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-stone-800 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-stone-800 block">{item.title}</span>
                      <span className="text-[11px] text-stone-400 leading-normal block">{item.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Technical standards tag stack */}
              <div className="bg-stone-50 border border-stone-200/50 rounded-xl p-3.5 mt-4">
                <h4 className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span>Production Stack</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {['React 18', 'TypeScript', 'TailwindCSS', 'NodeJS & Express', 'Supabase Security', 'AWS Cloud Edge'].map((s, i) => (
                    <span key={i} className="text-[9px] font-bold bg-white border border-stone-200 text-stone-600 px-2.5 py-0.5 rounded-md">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* PILLAR 3: WEBSITE SECURITY & MAINTENANCE */}
          <div className="bg-white border border-stone-200/70 rounded-2xl p-6 md:p-8 space-y-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-stone-950 to-stone-800"></div>
            <div className="space-y-5">
              <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-stone-950 border border-stone-200">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-stone-900">3. Security & Maintenance</h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Proactive system hardening, threat mitigation, and structured database safeguards.
                </p>
              </div>
              
              <ul className="space-y-3.5 pt-2 border-t border-stone-100">
                {[
                  { title: 'Vulnerability Checking & Fixing', desc: 'Comprehensive codebase auditing, scripting fixes, and patching of API endpoints.' },
                  { title: 'SOC Service Providing', desc: 'Active security operations monitoring to prevent script-injection or server disruption.' },
                  { title: 'Website Backup & Maintenance', desc: 'Daily offsite database backups, routine package updates, and code health audits.' },
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-2.5 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-stone-800 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-stone-800 block">{item.title}</span>
                      <span className="text-[11px] text-stone-400 leading-normal block">{item.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </section>

      {/* 3. BUSINESS SYNERGY / PROPOSAL */}
      <section className="bg-stone-950 text-white rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-stone-800/40 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative">
          
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-amber-400">
              <Building className="w-3 h-3" />
              <span>Platform Synergy Loop</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Exclusive Benefit for Registered Local Businesses
            </h2>
            <p className="text-stone-300 text-xs md:text-sm leading-relaxed">
              When business owners register on Directory.mu, they unlock an exclusive technological growth program. 
              By checking the permission box during listing configuration, you allow us to run high-level audits on your current web infrastructure. In exchange, you unlock:
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex gap-2 text-xs">
                <span className="text-amber-400 font-bold">1.</span>
                <div>
                  <h4 className="font-bold text-stone-100">Complimentary IT Audit</h4>
                  <p className="text-stone-400 text-[11px]">Free initial SEO diagnostic report and public-facing vulnerability checklist.</p>
                </div>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="text-amber-400 font-bold">2.</span>
                <div>
                  <h4 className="font-bold text-stone-100">Promotional Pricing Benefit</h4>
                  <p className="text-stone-400 text-[11px]">Receive a substantial promotional deduction on all our premium agency services.</p>
                </div>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="text-amber-400 font-bold">3.</span>
                <div>
                  <h4 className="font-bold text-stone-100">Localized Domain Backlinks</h4>
                  <p className="text-stone-400 text-[11px]">Direct high-authority backlink signals from the directory to boost your site authority.</p>
                </div>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="text-amber-400 font-bold">4.</span>
                <div>
                  <h4 className="font-bold text-stone-100">Priority Technical Support</h4>
                  <p className="text-stone-400 text-[11px]">Receive prioritized consultation when setting up localized host servers and databases.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-stone-800 pb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Written Permission Compliance</span>
            </h3>
            
            <p className="text-xs text-stone-400 leading-relaxed">
              By registering on our Mauritian business portal and agreeing to the promotional offer outreach consent, 
              you give us written permission to scan your online footprint and send tailored optimization offers. 
              We operate strictly within data privacy regulations—no mass spamming, just pure technological recommendations.
            </p>
            
            <div className="bg-stone-950/80 border border-stone-800/70 rounded-xl p-3.5 text-[11px] text-stone-300 space-y-2">
              <p className="font-semibold text-stone-100 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Active Engagement Path:</span>
              </p>
              <ul className="space-y-1.5 text-stone-400">
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Submit your company registration on Directory.mu</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Contact us with your listing link to initiate the free tech audit.</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </section>

      {/* 4. PROFESSIONAL CONTACT CTA BANNER */}
      <section className="bg-white border border-stone-200 rounded-3xl p-8 md:p-12 text-center max-w-4xl mx-auto shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-stone-100 rounded-full blur-2xl -mr-12 -mt-12 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-stone-50 rounded-full blur-2xl -ml-12 -mb-12 pointer-events-none"></div>
        
        <div className="relative space-y-6 max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-stone-900 text-white flex items-center justify-center mx-auto shadow-md">
            <Mail className="w-8 h-8 text-amber-400" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight">Let's Build Something Exceptional Together</h2>
            <p className="text-stone-500 text-xs md:text-sm leading-relaxed">
              Ready to accelerate your local search authority, craft modern web assets, or reinforce your network perimeter security? Get in touch directly to schedule a dedicated technical consultation.
            </p>
          </div>

          <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-stone-50 border border-stone-200 p-4 rounded-2xl w-full sm:w-auto">
            <div className="text-left space-y-0.5 px-2">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">Direct Inquiry Channel</span>
              <a 
                href="mailto:hello.bhagavati@gmail.com?subject=Inquiry for IT & Digital Marketing Services" 
                className="text-base md:text-lg font-bold text-stone-900 hover:text-stone-700 hover:underline flex items-center gap-2"
              >
                <span>hello.bhagavati@gmail.com</span>
                <ArrowUpRight className="w-4 h-4 text-stone-400 shrink-0" />
              </a>
            </div>
            <div className="w-px h-8 bg-stone-200 hidden sm:block"></div>
            <a 
              href="mailto:hello.bhagavati@gmail.com?subject=Request for IT Audit & Marketing Strategy" 
              className="bg-stone-950 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-stone-800 transition-all shadow-sm flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <Send className="w-3.5 h-3.5 text-stone-300" />
              <span>Send Email</span>
            </a>
          </div>

          <p className="text-[11px] text-stone-400">
            Typically responds to project briefs and technical assessment requests within 24 business hours.
          </p>
        </div>
      </section>
    </div>
  );
}
