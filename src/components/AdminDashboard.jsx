import React, { useState } from 'react';
import { Shield, LogOut, Activity, IndianRupee, Users, Package } from 'lucide-react';

export default function AdminDashboard({ onExitAdmin, templesData, onUpdateWaitTime }) {
  const [waitTimes, setWaitTimes] = useState({});

  const handleWaitTimeChange = (templeId, value) => {
    setWaitTimes(prev => ({ ...prev, [templeId]: value }));
  };

  const publishWaitTime = (templeId) => {
    if (waitTimes[templeId]) {
      onUpdateWaitTime(templeId, waitTimes[templeId]);
    }
  };

  return (
    <div className="min-h-screen bg-ivory-50 pb-20">
      {/* Admin Header */}
      <div className="bg-charcoal-900 text-ivory-50 pt-8 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-temple-gold-400" />
            <h1 className="font-display text-2xl font-bold tracking-wide">Temple Admin Portal</h1>
          </div>
          <button 
            onClick={onExitAdmin}
            className="flex items-center gap-2 bg-charcoal-800 hover:bg-charcoal-700 px-4 py-2 rounded-xl transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Exit Admin
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Bookings', value: '1,248', icon: Activity, color: 'text-copper-500', bg: 'bg-copper-50' },
            { label: 'Revenue (Today)', value: '₹45,200', icon: IndianRupee, color: 'text-sage-600', bg: 'bg-sage-50' },
            { label: 'Active Priests', value: '32', icon: Users, color: 'text-temple-gold-600', bg: 'bg-temple-gold-50' },
            { label: 'Pending Deliveries', value: '156', icon: Package, color: 'text-vermilion-500', bg: 'bg-vermilion-50' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-ivory-100 rounded-2xl p-6 shadow-warm border border-ivory-200">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-charcoal-500 font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-charcoal-900 mt-1">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Wait Time Editor */}
        <div className="bg-white rounded-3xl p-8 shadow-elevated border border-ivory-200">
          <h2 className="font-display text-2xl font-bold text-charcoal-900 mb-6">Manage Temple Wait Times</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-ivory-200 bg-ivory-50/50">
                  <th className="py-4 px-4 font-semibold text-charcoal-600">Temple Name</th>
                  <th className="py-4 px-4 font-semibold text-charcoal-600">Current Wait Time</th>
                  <th className="py-4 px-4 font-semibold text-charcoal-600">Update</th>
                  <th className="py-4 px-4 font-semibold text-charcoal-600 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-200">
                {templesData?.map(temple => (
                  <tr key={temple.id} className="hover:bg-ivory-50 transition-colors">
                    <td className="py-4 px-4 font-medium text-charcoal-900">{temple.name}</td>
                    <td className="py-4 px-4 text-charcoal-600">
                      <span className="bg-ivory-200 px-3 py-1 rounded-full text-sm font-medium">
                        {temple.waitTime || 'Not set'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <input 
                        type="text" 
                        placeholder="e.g. 45 mins" 
                        className="w-full max-w-[150px] border border-ivory-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-copper-400 focus:border-copper-400 outline-none"
                        value={waitTimes[temple.id] || ''}
                        onChange={(e) => handleWaitTimeChange(temple.id, e.target.value)}
                      />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button 
                        onClick={() => publishWaitTime(temple.id)}
                        className="bg-copper-400 hover:bg-copper-500 text-ivory-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                      >
                        Publish
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
