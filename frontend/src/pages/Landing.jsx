import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Brain, Mic, BellRing, TrendingUp, CheckCircle, Users, Award } from 'lucide-react';

const STATS = [
  { value: '80+', label: 'Verified Scholarships' },
  { value: '₹50K', label: 'Avg. Annual Benefit' },
  { value: '99%', label: 'Match Accuracy' },
  { value: '10K+', label: 'Girls Helped' },
];

const FEATURES = [
  {
    icon: Brain,
    title: 'Proactive AI Matchmaker',
    desc: 'Predicts eligibility using rule-based and logistic scoring algorithms to surface relevant aid instantly.',
  },
  {
    icon: Mic,
    title: 'Dialect Voice Explainer',
    desc: 'Translates and explains complex scheme rules in local dialects like Tamil & Hindi using voice technology.',
  },
  {
    icon: BellRing,
    title: 'Missed Opportunity Alerts',
    desc: 'Automated email reminders ensuring documentation is prepared and deadlines are met proactively.',
  },
  {
    icon: TrendingUp,
    title: 'Impact-Based Ranking',
    desc: 'Ranks scholarships based on our Social Uplift Score, prioritizing high-impact funding to reduce dropout risks.',
  },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Create Your Profile', desc: 'Fill in your academic, financial, and demographic details once.' },
  { step: '02', title: 'AI Matches You', desc: 'Our engine scores every eligible scheme against your profile in milliseconds.' },
  { step: '03', title: 'Apply With Confidence', desc: 'Get step-by-step roadmaps and deadline reminders for each scheme.' },
];

const Landing = () => {
  return (
    <div className="bg-white">

      {/* ── Hero ── */}
      <section className="bg-brand-600 relative overflow-hidden">
        {/* Subtle geometric accent (no gradient) */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%), repeating-linear-gradient(-45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)',
            backgroundSize: '30px 30px',
          }}
          aria-hidden="true"
        />

        <div className="page-container py-24 lg:py-36 relative">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 bg-white/10 text-white/90 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 animate-fade-in-up">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              AI-Powered · Government Verified · Free to Use
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] text-balance animate-fade-in-up animate-delay-100">
              Find Scholarships<br />
              <span className="text-blue-200">That Find You</span>
            </h1>

            <p className="mt-6 text-lg text-white/80 leading-relaxed max-w-xl mx-auto animate-fade-in-up animate-delay-200">
              AI-powered eligibility engine for women across India. Never miss a deadline — know exactly what you qualify for.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-3 animate-fade-in-up animate-delay-300">
              <Link
                to="/register"
                className="btn-primary bg-white text-brand-700 hover:bg-gray-100 active:bg-gray-200 shadow-md py-3 px-7 text-base font-bold gap-2"
              >
                Get Started Free
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/chat"
                className="btn-outline border-white/50 text-white hover:bg-white/10 hover:border-white py-3 px-7 text-base font-bold"
              >
                Quick Chat Match
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="border-b border-gray-100 bg-white">
        <div className="page-container py-8">
          <dl className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
            {STATS.map(({ value, label }, i) => (
              <div
                key={label}
                className={`px-6 py-4 text-center first:pl-0 last:pr-0 animate-fade-in-up`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <dt className="text-3xl font-extrabold text-brand-600">{value}</dt>
                <dd className="mt-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 bg-gray-50">
        <div className="page-container">
          <div className="text-center mb-14">
            <h2 className="section-title text-3xl font-extrabold">Platform Features</h2>
            <p className="section-subtitle mx-auto text-center mt-2">
              Everything you need to discover, understand, and apply for scholarships — in one place.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                className="card-interactive text-center flex flex-col items-center animate-fade-in-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center mb-5 text-brand-600
                                group-hover:bg-brand-100 transition-colors duration-200">
                  <Icon size={22} />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-20 bg-white">
        <div className="page-container">
          <div className="text-center mb-14">
            <h2 className="section-title text-3xl font-extrabold">How It Works</h2>
            <p className="section-subtitle mx-auto text-center mt-2">Three steps to your scholarship match.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8 relative">
            {/* Connector line desktop */}
            <div className="hidden sm:block absolute top-10 left-1/6 right-1/6 h-px bg-gray-200 pointer-events-none" aria-hidden="true" />

            {HOW_IT_WORKS.map(({ step, title, desc }, i) => (
              <div key={step} className="flex flex-col items-center text-center animate-fade-in-up" style={{ animationDelay: `${i * 120}ms` }}>
                <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center mb-5 shadow-btn relative z-10">
                  <span className="text-xl font-extrabold text-white">{step}</span>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-xs">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="bg-brand-600 py-16">
        <div className="page-container text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">
            Ready to find your scholarship?
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of girls who discovered eligible schemes through SakhiScholar.
          </p>
          <Link to="/register" className="btn-primary bg-white text-brand-700 hover:bg-gray-100 py-3 px-8 text-base font-bold shadow-md gap-2">
            Create Free Account <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-gray-100">
        <div className="page-container py-10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400 font-medium">
          <p>© {new Date().getFullYear()} SakhiScholar · Government Initiative Prototype</p>
          <nav className="flex gap-6" aria-label="Footer links">
            {['About', 'Privacy Policy', 'Contact', 'Helpline: 1800-SAKHI'].map(l => (
              <a key={l} href="#" className="hover:text-brand-600 transition-colors duration-150">{l}</a>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
