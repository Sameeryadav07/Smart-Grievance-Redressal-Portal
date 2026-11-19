import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-2 bg-blue-800/80 border border-blue-400/30 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider text-blue-200">
            <span>🇮🇳 National Public Redressal Initiative</span>
            <span>•</span>
            <span className="text-emerald-400">AI-Powered NextGen GovTech</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Transparent, Instant, & Intelligent{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-sky-300 to-emerald-300">
              Grievance Redressal
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-lg text-blue-100/90 font-normal leading-relaxed">
            Empowering citizens to report civic grievances with geotagged media. Our integrated AI
            engine inspects photos for tampering, flags duplicates, automatically classifies issues,
            and routes them directly to the competent nodal officers.
          </p>

          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <Link
              href="/submit"
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold text-base shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5"
            >
              📝 File a New Grievance
            </Link>
            <Link
              href="/track"
              className="px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-base border border-white/20 backdrop-blur-sm transition-all"
            >
              🔍 Track Grievance Status
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto border-t border-blue-800/60">
            <div className="p-3">
              <p className="text-2xl sm:text-3xl font-black text-white">99.4%</p>
              <p className="text-xs text-blue-200 uppercase tracking-wider">AI Routing Accuracy</p>
            </div>
            <div className="p-3">
              <p className="text-2xl sm:text-3xl font-black text-emerald-400">&lt; 1 sec</p>
              <p className="text-xs text-blue-200 uppercase tracking-wider">Image ELA Tampering Scan</p>
            </div>
            <div className="p-3">
              <p className="text-2xl sm:text-3xl font-black text-sky-300">8 Nodal</p>
              <p className="text-xs text-blue-200 uppercase tracking-wider">Govt Departments</p>
            </div>
            <div className="p-3">
              <p className="text-2xl sm:text-3xl font-black text-amber-300">24x7</p>
              <p className="text-xs text-blue-200 uppercase tracking-wider">Real-Time Redressal</p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Pillar Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
            Core AI Architecture
          </span>
          <h2 className="text-3xl font-black text-slate-900 mt-2">
            Automating Civil Governance with Multi-Stage AI
          </h2>
          <p className="text-slate-600 mt-3 text-sm">
            Eliminating fake complaints, bureaucratic delays, and redundant investigations with
            modern computer vision and natural language processing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center text-2xl mb-4">
              🛡️
            </div>
            <h3 className="text-lg font-bold text-slate-900">Fake Image Detection</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Error Level Analysis (ELA) identifies digital alterations, photoshop splices, or
              recompression anomalies, assigning a confidence tampering score.
            </p>
            <span className="inline-block mt-4 text-xs font-semibold text-red-700 bg-red-50 px-2.5 py-1 rounded">
              ELA + EXIF Analysis
            </span>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-2xl mb-4">
              📑
            </div>
            <h3 className="text-lg font-bold text-slate-900">Duplicate Submission Filter</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Calculates cosine text similarity combined with 500m Haversine geographic proximity to
              cluster identical citizen issues into a single resolution thread.
            </p>
            <span className="inline-block mt-4 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded">
              TF-IDF + Geolocation
            </span>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-2xl mb-4">
              🏷️
            </div>
            <h3 className="text-lg font-bold text-slate-900">NLP Auto-Classification</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Analyzes titles and descriptions to suggest relevant civic categories (e.g., Road
              Damage, Water Contamination, Power Outages) with confidence weights.
            </p>
            <span className="inline-block mt-4 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded">
              Keyword Weighted Scoring
            </span>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl mb-4">
              ⚡
            </div>
            <h3 className="text-lg font-bold text-slate-900">Autonomous Dept Routing</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Determines the nodal department (PWD, Water Board, Police, Health) and dynamically
              escalates priority based on hazard severity and urgency keywords.
            </p>
            <span className="inline-block mt-4 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded">
              Priority Escalation Matrix
            </span>
          </div>
        </div>
      </section>

      {/* How it Works Stepper */}
      <section className="bg-slate-100/70 py-16 px-4 sm:px-6 lg:px-8 border-y border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
              Citizen Workflow
            </span>
            <h2 className="text-3xl font-black text-slate-900 mt-2">
              From Report to Resolution in 4 Simple Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-blue-600 text-white font-black text-xl flex items-center justify-center shadow-md mb-4">
                1
              </div>
              <h4 className="font-bold text-slate-900 text-base">Submit Grievance</h4>
              <p className="text-xs text-slate-600 mt-1">
                Citizen submits issue description, uploads site photograph, and geo-pins location.
              </p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-md mb-4">
                2
              </div>
              <h4 className="font-bold text-slate-900 text-base">AI Inspection</h4>
              <p className="text-xs text-slate-600 mt-1">
                System runs Error Level Analysis on image, cross-checks duplicates, and assesses validity.
              </p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-600 text-white font-black text-xl flex items-center justify-center shadow-md mb-4">
                3
              </div>
              <h4 className="font-bold text-slate-900 text-base">Department Dispatched</h4>
              <p className="text-xs text-slate-600 mt-1">
                Issue is automatically dispatched to the exact department officer with an assigned priority.
              </p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-amber-600 text-white font-black text-xl flex items-center justify-center shadow-md mb-4">
                4
              </div>
              <h4 className="font-bold text-slate-900 text-base">Track & Resolve</h4>
              <p className="text-xs text-slate-600 mt-1">
                Real-time tracking ID updates with officer remarks until final resolution is verified.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-300 py-10 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🏛️</span>
            <div>
              <p className="text-sm font-bold text-white">Jan-Samadhan Grievance Portal</p>
              <p className="text-xs text-slate-400">
                Department of Administrative Reforms & Public Grievances
              </p>
            </div>
          </div>
          <div className="text-xs text-slate-400 text-center md:text-right">
            <p>Built with Next.js 14, React, Tailwind CSS, Prisma, and Local AI Vision Engine.</p>
            <p className="mt-1">For Academic & Administrative Demonstration Purposes.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
