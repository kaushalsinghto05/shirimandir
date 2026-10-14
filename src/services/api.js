const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Universal API Client for Shiri Mandir
 * Features:
 * - Bearer JWT authentication from localStorage
 * - Global 401 interception: clears invalid/expired session and redirects to /login
 */
export async function apiRequest(endpoint, { method = 'GET', body = null, headers = {} } = {}) {
  const token = localStorage.getItem('shirimandir_token');
  const customHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers
  };

  const config = {
    method,
    headers: customHeaders,
    credentials: 'include' // Transmit cookies across origins
  };

  if (body && !(body instanceof FormData)) {
    config.body = JSON.stringify(body);
  } else if (body instanceof FormData) {
    delete customHeaders['Content-Type']; // Let browser set boundary
    config.body = body;
  }

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Global 401 Session Expiry Interceptor
    if (res.status === 401) {
      localStorage.removeItem('shirimandir_token');
      localStorage.removeItem('shirimandir_user');
      document.cookie = 'shirimandir_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login?expired=1';
      }
    }

    const data = await res.json().catch(() => null);
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    console.warn(`[API] Network error calling ${endpoint}:`, err.message);
    return { ok: false, status: 0, error: err.message };
  }
}

// ── Auth Services ──
export const authService = {
  login: async (email, password) => {
    const res = await apiRequest('/auth/login', { 
      method: 'POST', 
      body: { email: email.trim(), password } 
    });
    if (res.ok && res.data?.data) {
      const token = res.data.data.token;
      const user = res.data.data.user || res.data.data;
      if (token) localStorage.setItem('shirimandir_token', token);
      if (user && user.id) localStorage.setItem('shirimandir_user', JSON.stringify(user));
    }
    return res;
  },

  register: async ({ email, password }) => {
    const res = await apiRequest('/auth/register', { 
      method: 'POST', 
      body: { email: email.trim(), password } 
    });
    if (res.ok && res.data?.data) {
      const token = res.data.data.token;
      const user = res.data.data.user || res.data.data;
      if (token) localStorage.setItem('shirimandir_token', token);
      if (user && user.id) localStorage.setItem('shirimandir_user', JSON.stringify(user));
    }
    return res;
  },

  completeProfile: async (profileData) => {
    const res = await apiRequest('/auth/complete-profile', { 
      method: 'PUT', 
      body: profileData 
    });
    if (res.ok && res.data?.data) {
      const token = res.data.data.token;
      const user = res.data.data.user || res.data.data;
      if (token) localStorage.setItem('shirimandir_token', token);
      if (user && user.id) localStorage.setItem('shirimandir_user', JSON.stringify(user));
    }
    return res;
  },

  getProfile: async () => {
    const res = await apiRequest('/auth/me');
    if (res.ok && res.data?.data) {
      const user = res.data.data.user || res.data.data;
      if (user && user.id) {
        localStorage.setItem('shirimandir_user', JSON.stringify(user));
      }
    }
    return res;
  },

  updateConsent: (consent_data_sharing) => 
    apiRequest('/auth/consent', { method: 'PUT', body: { consent_data_sharing } }),

  logout: () => {
    localStorage.removeItem('shirimandir_token');
    localStorage.removeItem('shirimandir_user');
    document.cookie = 'shirimandir_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },

  // Super Admin Role Management
  getAllUsers: () => apiRequest('/auth/users'),
  changeUserRole: (userId, role) => apiRequest(`/auth/users/${userId}/role`, { method: 'PUT', body: { role } }),
  createAdmin: (adminData) => apiRequest('/auth/create-admin', { method: 'POST', body: adminData })
};

// ── Temple Services ──
export const templeService = {
  getAll: (params = '') => apiRequest(`/temples${params}`),
  getBySlug: (slug) => apiRequest(`/temples/${slug}`),
  create: (formData) => apiRequest('/temples', { method: 'POST', body: formData }),
  updateVerification: (id, data) => apiRequest(`/temples/${id}/verification`, { method: 'PUT', body: data })
};

// ── Puja Services ──
export const pujaService = {
  getAll: (params = '') => apiRequest(`/pujas${params}`),
  getById: (id) => apiRequest(`/pujas/${id}`)
};

// ── Prasad Services ──
export const prasadService = {
  getAll: (params = '') => apiRequest(`/prasad${params}`),
  getById: (id) => apiRequest(`/prasad/${id}`),
  create: (item) => apiRequest('/prasad', { method: 'POST', body: item }),
  approveFSSAI: (id) => apiRequest(`/prasad/${id}/approve-fssai`, { method: 'PUT' })
};

// ── Booking Services ──
export const bookingService = {
  create: (booking) => apiRequest('/bookings', { method: 'POST', body: booking }),
  getMyBookings: () => apiRequest('/bookings/my'),
  getById: (id) => apiRequest(`/bookings/${id}`),
  uploadProof: (id, proofData) => apiRequest(`/bookings/${id}/proof`, { method: 'PUT', body: proofData })
};

// ── Order Services ──
export const orderService = {
  calculate: (items) => apiRequest('/orders/calculate', { method: 'POST', body: { items } }),
  create: (order) => apiRequest('/orders', { method: 'POST', body: order }),
  getMyOrders: () => apiRequest('/orders/my')
};

// ── Payment Services ──
export const paymentService = {
  createIntent: (payload) => apiRequest('/payments/intent', { method: 'POST', body: payload }),
  verifyPayment: (payload) => apiRequest('/payments/verify', { method: 'POST', body: payload }),
  getMyPayments: () => apiRequest('/payments/my')
};

// ── Refund Services ──
export const refundService = {
  getPolicy: (bookingId) => apiRequest(`/refunds/policy?booking_id=${bookingId}`),
  requestRefund: (payload) => apiRequest('/refunds/request', { method: 'POST', body: payload }),
  getMyRefunds: () => apiRequest('/refunds/my')
};

// ── Admin Services ──
export const adminService = {
  getMetrics: () => apiRequest('/admin/metrics'),
  getRefunds: () => apiRequest('/admin/refunds'),
  reviewRefund: (id, status, admin_notes) => apiRequest(`/admin/refunds/${id}/review`, { method: 'PUT', body: { status, admin_notes } })
};
