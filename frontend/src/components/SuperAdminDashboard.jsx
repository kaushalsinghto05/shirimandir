import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, ShieldCheck, Users, UserPlus, LogOut, CheckCircle2, 
  AlertCircle, RefreshCw, KeyRound, ExternalLink, ArrowRight 
} from 'lucide-react';
import { authService, adminService } from '../services/api';

export default function SuperAdminDashboard({ currentUser, onLogout }) {
  const [users, setUsers] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // New Admin Form State
  const [newAdminForm, setNewAdminForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [usersRes, metricsRes] = await Promise.all([
        authService.getAllUsers(),
        adminService.getMetrics()
      ]);

      if (usersRes.ok && Array.isArray(usersRes.data?.data)) {
        setUsers(usersRes.data.data);
      }
      if (metricsRes.ok && metricsRes.data?.data) {
        setMetrics(metricsRes.data.data);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load user and metric lists.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle changing another user's role
  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Are you sure you want to change user #${userId} role to '${newRole}'?`)) {
      return;
    }

    try {
      const res = await authService.changeUserRole(userId, newRole);
      if (res.ok) {
        setSuccessMsg(`User #${userId} role updated to '${newRole}' successfully.`);
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg(res.data?.error || res.error || 'Failed to change user role.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Role change request failed.');
    }
  };

  // Handle creating a new administrator
  const handleCreateAdminSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!newAdminForm.email || !newAdminForm.password) {
      setErrorMsg('Email and password are required for new administrator.');
      return;
    }

    if (newAdminForm.password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    setCreatingAdmin(true);
    try {
      const res = await authService.createAdmin(newAdminForm);
      if (res.ok && res.data?.data) {
        setSuccessMsg(`New Administrator '${newAdminForm.email}' created successfully!`);
        setNewAdminForm({ name: '', email: '', password: '', phone: '' });
        loadData();
        setTimeout(() => setSuccessMsg(''), 5000);
      } else {
        setErrorMsg(res.data?.error || res.error || 'Failed to create administrator.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Network error creating admin.');
    } finally {
      setCreatingAdmin(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FEFDFB] pb-20 font-sans text-charcoal-900">
      
      {/* Super Admin Top Banner */}
      <div className="bg-[#1A1733] text-white pt-8 pb-14 px-4 sm:px-6 lg:px-8 border-b border-[#2C284D]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-[#d4a15a] to-[#c87d43] text-white shadow-md">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-xl sm:text-2xl font-bold tracking-wide">
                  Super Administrator Control Center
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-temple-gold-500/20 text-temple-gold-400 border border-temple-gold-500/30">
                  Role: super_admin
                </span>
              </div>
              <p className="text-xs text-charcoal-300 mt-0.5">
                Privileged Access • Role Governance • Platform Administration
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/admin/dashboard"
              className="px-3.5 py-2 bg-charcoal-800 hover:bg-charcoal-700 text-xs font-semibold rounded-xl transition-all border border-charcoal-700 flex items-center gap-1.5"
            >
              <span>Operations Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={onLogout || authService.logout}
              className="flex items-center gap-1.5 bg-vermilion-700/80 hover:bg-vermilion-700 px-3.5 py-2 rounded-xl transition-colors text-xs font-bold"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 space-y-6">
        
        {/* Alerts */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-vermilion-50 border border-vermilion-200 text-vermilion-700 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* System Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-ivory-300 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-copper-50 text-copper-600">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-charcoal-500 font-medium">Total Registered Users</p>
                <p className="text-2xl font-bold font-mono text-charcoal-900">{users.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-ivory-300 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-charcoal-500 font-medium">Administrators on File</p>
                <p className="text-2xl font-bold font-mono text-charcoal-900">
                  {users.filter(u => ['admin', 'super_admin'].includes(u.role)).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-ivory-300 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-charcoal-500 font-medium">Active Devotees</p>
                <p className="text-2xl font-bold font-mono text-charcoal-900">
                  {users.filter(u => u.role === 'devotee').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Create New Administrator Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ivory-300 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-ivory-200">
            <UserPlus className="w-5 h-5 text-copper-600" />
            <div>
              <h2 className="font-display text-base sm:text-lg font-bold text-charcoal-900">
                Privileged Role Creation: Create New Administrator
              </h2>
              <p className="text-[11px] text-charcoal-500">
                Rule: Only super_admin can create new administrators or grant admin permissions.
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateAdminSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">Admin Name</label>
              <input
                type="text"
                required
                value={newAdminForm.name}
                onChange={(e) => setNewAdminForm({ ...newAdminForm, name: e.target.value })}
                placeholder="e.g. Sanctum Operations Manager"
                className="w-full p-2.5 rounded-xl border border-ivory-300 focus:ring-2 focus:ring-copper-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">Admin Email *</label>
              <input
                type="email"
                required
                value={newAdminForm.email}
                onChange={(e) => setNewAdminForm({ ...newAdminForm, email: e.target.value })}
                placeholder="admin@shirimandir.org"
                className="w-full p-2.5 rounded-xl border border-ivory-300 focus:ring-2 focus:ring-copper-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">Temporary Password *</label>
              <input
                type="password"
                required
                value={newAdminForm.password}
                onChange={(e) => setNewAdminForm({ ...newAdminForm, password: e.target.value })}
                placeholder="Min. 8 characters"
                className="w-full p-2.5 rounded-xl border border-ivory-300 focus:ring-2 focus:ring-copper-400 focus:outline-none"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={creatingAdmin}
                className="w-full p-2.5 rounded-xl bg-copper-500 hover:bg-copper-600 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
              >
                {creatingAdmin ? 'Creating...' : 'Grant Admin Role'}
              </button>
            </div>
          </form>
        </div>

        {/* Section: Platform User Role Management Table */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ivory-300 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-ivory-200">
            <div>
              <h2 className="font-display text-base sm:text-lg font-bold text-charcoal-900">
                User Role & Profile Status Governance
              </h2>
              <p className="text-[11px] text-charcoal-500">
                Manage role assignments and inspect profile completion flags across all users.
              </p>
            </div>
            <button
              onClick={loadData}
              className="p-2 rounded-xl border border-ivory-300 hover:bg-ivory-100 text-charcoal-700 text-xs flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-ivory-200 bg-ivory-50 text-charcoal-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Profile Completed</th>
                  <th className="py-3 px-4">Current Role</th>
                  <th className="py-3 px-4 text-right">Change Role (Super Admin Action)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-200">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-ivory-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-charcoal-900">
                      {u.name || '(No name set)'}
                      <span className="block text-[10px] text-charcoal-400 font-mono font-normal">
                        User #{u.id} • Registered: {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Seeded'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-charcoal-700">
                      {u.email}
                      {u.phone && <span className="block text-[10px] text-charcoal-400">{u.phone}</span>}
                    </td>
                    <td className="py-3.5 px-4">
                      {u.profile_completed ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Complete
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          Incomplete (/complete-profile)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        u.role === 'super_admin' ? 'bg-purple-100 text-purple-800' :
                        u.role === 'admin' ? 'bg-copper-100 text-copper-800' :
                        'bg-charcoal-100 text-charcoal-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      {['devotee', 'admin', 'super_admin'].map(r => (
                        <button
                          key={r}
                          disabled={u.role === r || u.id === currentUser?.id}
                          onClick={() => handleRoleChange(u.id, r)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors ${
                            u.role === r
                              ? 'bg-ivory-200 text-charcoal-400 cursor-default'
                              : 'bg-white border border-ivory-300 text-charcoal-700 hover:bg-charcoal-900 hover:text-white'
                          }`}
                        >
                          Make {r}
                        </button>
                      ))}
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
