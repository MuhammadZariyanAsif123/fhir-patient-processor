"use client";

import { useEffect, useState, useMemo } from 'react';

interface Patient {
  id: string;
  name: string;
  gender: string;
  birth_date: string;
  risk_level: "High" | "Moderate" | "Low" | "Unknown";
}

export default function Dashboard() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSynced, setLastSynced] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPatients = async (count: number = 10) => {
    setLoading(true);
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

      const response = await fetch(`${apiBaseUrl}/api/v1/patients/risk-assessment?count=${count}&t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      const result = await response.json();

      if (result.status === 'success') {
        setPatients(result.data);
        setLastSynced(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === "N/A") return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const filteredPatients = useMemo(() => {
    return patients.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [patients, searchQuery]);

  const totalPatients = patients.length;
  const highRiskCount = patients.filter(p => p.risk_level === 'High').length;
  const moderateRiskCount = patients.filter(p => p.risk_level === 'Moderate').length;

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'High':
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-sm hover:shadow-md hover:scale-105 transition-all cursor-default">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
            </span>
            Critical
          </span>
        );
      case 'Moderate':
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-sm hover:shadow-md hover:scale-105 transition-all cursor-default">
            <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"></span>
            Elevated
          </span>
        );
      case 'Low':
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm hover:shadow-md hover:scale-105 transition-all cursor-default">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Standard
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 shadow-sm hover:shadow-md hover:scale-105 transition-all cursor-default">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            Unassessed
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fadeInUp { 
          from { opacity: 0; transform: translateY(12px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        .animate-fade-in-up { 
          animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; 
          opacity: 0;
        }
        .shimmer {
          background: #f6f7f8;
          background-image: linear-gradient(to right, #f6f7f8 0%, #edeef1 20%, #f6f7f8 40%, #f6f7f8 100%);
          background-repeat: no-repeat;
          background-size: 800px 104px; 
          display: inline-block;
          position: relative; 
          animation-duration: 1.5s;
          animation-fill-mode: forwards; 
          animation-iteration-count: infinite;
          animation-name: placeholderShimmer;
          animation-timing-function: linear;
        }
        @keyframes placeholderShimmer {
          0% { background-position: -468px 0; }
          100% { background-position: 468px 0; }
        }
      `}} />

      {/* Application Header with Glassmorphism */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-md shadow-indigo-200">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <span className="text-base font-bold text-slate-900 tracking-tight">Nexus Health OS</span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-sm font-semibold text-slate-500">
            <span className="px-3 py-2 rounded-md bg-slate-100 text-indigo-700 shadow-inner">Patients</span>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <div className="relative hidden md:block group">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input
              type="text"
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-100/50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white w-64 transition-all"
            />
          </div>
          <div className="h-9 w-9 rounded-full bg-linear-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-xs font-bold text-white shadow-md ring-2 ring-white cursor-pointer hover:scale-105 transition-transform">
            ZA
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-8">
        <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Population Risk Assessment</h1>
            <p className="text-slate-500 mt-1.5 text-sm flex items-center gap-2 font-medium">
              Connected to HL7 FHIR stream
              {lastSynced && <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300"></span>}
              {lastSynced && <span>Last synced: {lastSynced}</span>}
            </p>
          </div>
          <div className="flex items-center gap-3">

            <button
              onClick={() => {
                const randomCount = Math.floor(Math.random() * (30 - 5 + 1) + 5);
                fetchPatients(randomCount);
              }}
              disabled={loading}
              className="px-4 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              {loading ? 'Syncing Pipeline...' : 'Fetch Live Data'}
            </button>
          </div>
        </header>

        {/* Interactive Analytics Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 group-hover:text-indigo-500 transition-colors">Total Records</p>
            <p className="text-3xl font-black text-slate-800">{loading ? '-' : totalPatients}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 group-hover:text-rose-500 transition-colors">Critical Priority</p>
            <p className="text-3xl font-black text-rose-600">{loading ? '-' : highRiskCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 group-hover:text-amber-500 transition-colors">Elevated Risk</p>
            <p className="text-3xl font-black text-amber-600">{loading ? '-' : moderateRiskCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">System Status</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <p className="text-sm font-bold text-emerald-600 tracking-wide">Secure & Online</p>
            </div>
          </div>
        </div>

        {/* Main Data Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          {loading ? (
            <div className="p-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 py-4 border-b border-slate-50 last:border-0">
                  <div className="h-4 shimmer rounded w-24"></div>
                  <div className="h-4 shimmer rounded w-48 ml-auto"></div>
                  <div className="h-4 shimmer rounded w-16 ml-auto"></div>
                  <div className="h-8 shimmer rounded-full w-24 ml-auto"></div>
                </div>
              ))}
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <h3 className="text-base font-bold text-slate-800">No patients found</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">We couldn't find any records matching your search query. Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80">
                    <th className="py-4 px-6 text-xs font-extrabold text-slate-400 uppercase tracking-wider">ID</th>
                    <th className="py-4 px-6 text-xs font-extrabold text-slate-400 uppercase tracking-wider">Patient Name</th>
                    <th className="py-4 px-6 text-xs font-extrabold text-slate-400 uppercase tracking-wider">Sex</th>
                    <th className="py-4 px-6 text-xs font-extrabold text-slate-400 uppercase tracking-wider">Date of Birth</th>
                    <th className="py-4 px-6 text-xs font-extrabold text-slate-400 uppercase tracking-wider">Clinical Assessment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80">
                  {filteredPatients.map((patient, index) => (
                    <tr
                      key={patient.id}
                      className="hover:bg-slate-50/50 transition-colors animate-fade-in-up group cursor-default"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="py-4 px-6 text-sm text-slate-400 font-mono group-hover:text-slate-600 transition-colors">{patient.id.substring(0, 8)}...</td>
                      <td className="py-4 px-6 text-sm font-bold text-slate-800">
                        {patient.name}
                      </td>
                      <td className="py-4 px-6 text-sm font-medium text-slate-500 capitalize">{patient.gender}</td>
                      <td className="py-4 px-6 text-sm font-medium text-slate-500">{formatDate(patient.birth_date)}</td>
                      <td className="py-4 px-6">
                        {getRiskBadge(patient.risk_level)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}