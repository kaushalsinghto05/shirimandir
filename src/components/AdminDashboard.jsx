import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Sparkles, 
  Truck, 
  Radio, 
  Clock, 
  Search, 
  CheckCircle2, 
  Edit3, 
  TrendingUp, 
  ArrowLeft,
  Calendar,
  DollarSign
} from 'lucide-react';
import { TEMPLES, MOCK_USER_BOOKINGS } from '../data/mockData';

export default function AdminDashboard({ 
  onExitAdmin, 
  templesData, 
  onUpdateWaitTime 
}) {
  const [selectedTempleForEdit, setSelectedTempleForEdit] = useState(templesData[0]);
  const [newWaitMinutes, setNewWaitMinutes] = useState(templesData[0]?.waitMinutes || 15);
  const [searchFilter, setSearchFilter] = useState('');

  const handleSaveWaitTime = (e) => {
    e.preventDefault();
    if (onUpdateWaitTime) {
      onUpdateWaitTime(selectedTempleForEdit.id, parseInt(newWaitMinutes, 10));
    }
  };

  return (
    <div className="py-10 bg-sandstone-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-sanctum-950 text-white p-6 rounded-3xl border border-gold-500/30 shadow-sanctum">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-tulsi-500/20 border border-tulsi-500 flex items-center justify-center text-tulsi-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-white">
                  MandirVeda Devasthanam Administration
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-gold-500/20 text-gold-300 text-[10px] font-bold uppercase">
                  Central Node
                </span>
              </div>
              <p className="text-xs text-sandstone-300">
                Temple crowd management, officiating priest assignments & prasad logistics
              </p>
            </div>
          </div>

          <button
            onClick={onExitAdmin}
            className="self-start sm:self-center px-4 py-2 rounded-xl bg-sanctum-900 hover:bg-gold-500 text-gold-300 hover:text-sanctum-950 text-xs font-bold transition-all flex items-center gap-2 border border-gold-500/30"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Devotee Site</span>
          </button>
        </div>

        {/* 4 Key Analytics Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          
          <div className="p-5 bg-white rounded-3xl border border-sandstone-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sandstone-500 uppercase tracking-wider">Devotees Today</span>
              <div className="p-2 rounded-xl bg-gold-50 text-gold-700">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-serif font-bold text-sanctum-950 mt-2">18,420</div>
            <p className="text-[11px] text-tulsi-700 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>+14.8% over last Ekadashi</span>
            </p>
          </div>

          <div className="p-5 bg-white rounded-3xl border border-sandstone-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sandstone-500 uppercase tracking-wider">Seva Dakshina</span>
              <div className="p-2 rounded-xl bg-tulsi-50 text-tulsi-700">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-serif font-bold text-sanctum-950 mt-2">₹4,92,400</div>
            <p className="text-[11px] text-sandstone-500 mt-1">100% 80G Tax Tagged</p>
          </div>

          <div className="p-5 bg-white rounded-3xl border border-sandstone-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sandstone-500 uppercase tracking-wider">Active Live Streams</span>
              <div className="p-2 rounded-xl bg-red-50 text-red-600">
                <Radio className="w-4 h-4 animate-pulse" />
              </div>
            </div>
            <div className="text-2xl font-serif font-bold text-sanctum-950 mt-2">6 Temples</div>
            <p className="text-[11px] text-tulsi-700 mt-1">0% latency reported</p>
          </div>

          <div className="p-5 bg-white rounded-3xl border border-sandstone-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sandstone-500 uppercase tracking-wider">Prasad Dispatches</span>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                <Truck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-serif font-bold text-sanctum-950 mt-2">42 Pending</div>
            <p className="text-[11px] text-sandstone-500 mt-1">India Post Speed Sacred</p>
          </div>

        </div>

        {/* 2-Column Section: Live Queue Manager + Booking Management Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Live Darshan Queue Telemetry Controller */}
          <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-sandstone-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-sanctum-950">
              <Clock className="w-5 h-5 text-gold-600" />
              <h3 className="font-serif font-bold text-base">Live Queue Telemetry Controller</h3>
            </div>
            <p className="text-xs text-sandstone-600">
              Adjust the physical wait time displayed to devotees on the website and app in real-time.
            </p>

            <form onSubmit={handleSaveWaitTime} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-sandstone-700 mb-1 uppercase">
                  Select Temple Devasthanam
                </label>
                <select
                  value={selectedTempleForEdit.id}
                  onChange={(e) => {
                    const found = templesData.find(t => t.id === e.target.value);
                    if (found) {
                      setSelectedTempleForEdit(found);
                      setNewWaitMinutes(found.waitMinutes);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-sandstone-300 text-xs bg-sandstone-50 focus:outline-none focus:border-gold-500"
                >
                  {templesData.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.city || t.location.split(',')[0]})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-sandstone-700 mb-1 uppercase">
                  Current Wait Estimate (Minutes): <strong>{newWaitMinutes} mins</strong>
                </label>
                <input
                  type="range"
                  min="5"
                  max="90"
                  step="5"
                  value={newWaitMinutes}
                  onChange={(e) => setNewWaitMinutes(e.target.value)}
                  className="w-full accent-gold-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-sandstone-500 mt-1">
                  <span>5 mins (Low)</span>
                  <span>45 mins (Moderate)</span>
                  <span>90 mins (Peak Rush)</span>
                </div>
              </div>

              <div className="p-3 bg-sandstone-50 rounded-xl border border-sandstone-200 text-xs">
                <span className="text-sandstone-500 block">Preview for Devotees:</span>
                <span className="font-bold text-sanctum-950 block mt-0.5">
                  🟢 ~{newWaitMinutes} mins • {newWaitMinutes > 30 ? 'Peak Rush' : 'Smooth Darshan'}
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-sanctum-950 hover:bg-gold-500 text-gold-300 hover:text-sanctum-950 font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Publish Updated Wait Time</span>
              </button>
            </form>
          </div>

          {/* Booking & Priest Allocations Table */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-sandstone-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-serif font-bold text-base text-sanctum-950">Devotee Booking & Priest Allocations</h3>
                <p className="text-xs text-sandstone-600">Assign Vedic Shastris and verify gotra recitation status.</p>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-sandstone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter bookings or Gotra..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs rounded-xl bg-sandstone-50 border border-sandstone-200 focus:outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-sandstone-100 text-sandstone-700 uppercase font-semibold">
                  <tr>
                    <th className="p-3 rounded-l-xl">Booking ID</th>
                    <th className="p-3">Seva / Ritual</th>
                    <th className="p-3">Devotee & Gotra</th>
                    <th className="p-3">Allocated Archaka</th>
                    <th className="p-3 rounded-r-xl">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sandstone-200">
                  {MOCK_USER_BOOKINGS.map((b) => (
                    <tr key={b.id} className="hover:bg-sandstone-50">
                      <td className="p-3 font-mono font-bold text-gold-800">{b.id}</td>
                      <td className="p-3 font-medium text-sanctum-900">{b.pujaTitle}</td>
                      <td className="p-3 text-sandstone-700">{b.devotees[0]}</td>
                      <td className="p-3 text-sandstone-600">
                        <span className="font-medium text-sanctum-950">Pt. Vidyadhar Shastri</span>
                        <span className="text-[10px] text-tulsi-700 block">Verified Archaka</span>
                      </td>
                      <td className="p-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-tulsi-100 text-tulsi-800">
                          {b.statusBadge}
                        </span>
                      </td>
                    </tr>
                  ))}
                  <tr className="hover:bg-sandstone-50">
                    <td className="p-3 font-mono font-bold text-gold-800">MV-2026-9921</td>
                    <td className="p-3 font-medium text-sanctum-900">Maha Sudarshana Homa</td>
                    <td className="p-3 text-sandstone-700">Ramesh Sharma (Bharadwaj)</td>
                    <td className="p-3 text-sandstone-600">
                      <span className="font-medium text-sanctum-950">Pt. Raghunath Archaka</span>
                      <span className="text-[10px] text-tulsi-700 block">Verified Archaka</span>
                    </td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        Pending Broadcast
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
