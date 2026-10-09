const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Universal API Client for Shiri Mandir
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
    headers: customHeaders
  };

  if (body && !(body instanceof FormData)) {
    config.body = JSON.stringify(body);
  } else if (body instanceof FormData) {
    delete customHeaders['Content-Type']; // Let browser set boundary
    config.body = body;
  }

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    console.warn(`[API] Network error calling ${endpoint}:`, err.message);
    return { ok: false, status: 0, error: err.message };
  }
}

// ── Auth Services ──
export const authService = {
  login: async (email, password) => {
    const res = await apiRequest('/auth/login', { method: 'POST', body: { email, password } });
    if (res.ok && res.data?.data?.token) {
      localStorage.setItem('shirimandir_token', res.data.data.token);
    }
    return res;
  },
  register: async (payload) => {
    const res = await apiRequest('/auth/register', { method: 'POST', body: payload });
    if (res.ok && res.data?.data?.token) {
      localStorage.setItem('shirimandir_token', res.data.data.token);
    }
    return res;
  },
  getProfile: () => apiRequest('/auth/me'),
  updateConsent: (consent_data_sharing) => apiRequest('/auth/consent', { method: 'PUT', body: { consent_data_sharing } }),
  logout: () => {
    localStorage.removeItem('shirimandir_token');
  }
};

// ── Temple Services ──
export const templeService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/temples${query ? `?${query}` : ''}`);
  },
  getBySlug: (slug) => apiRequest(`/temples/${slug}`),
  updateVerification: (templeId, payload) => apiRequest(`/temples/${templeId}/verification`, { method: 'PUT', body: payload })
};

// ── Puja & Seva Services ──
export const pujaService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/pujas${query ? `?${query}` : ''}`);
  },
  getById: (id) => apiRequest(`/pujas/${id}`)
};

// ── Prasad Store Services ──
export const prasadService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/prasad${query ? `?${query}` : ''}`);
  },
  getById: (id) => apiRequest(`/prasad/${id}`),
  approveFSSAI: (id) => apiRequest(`/prasad/${id}/approve-fssai`, { method: 'PUT' })
};

// ── Booking Services ──
export const bookingService = {
  create: (payload) => apiRequest('/bookings', { method: 'POST', body: payload }),
  getMyBookings: () => apiRequest('/bookings/my'),
  getById: (id) => apiRequest(`/bookings/${id}`),
  uploadProof: (id, payload) => apiRequest(`/bookings/${id}/proof`, { method: 'PUT', body: payload })
};

// ── Order Services ──
export const orderService = {
  calculateCheckout: (items) => apiRequest('/orders/calculate', { method: 'POST', body: { items } }),
  create: (payload) => apiRequest('/orders', { method: 'POST', body: payload }),
  getMyOrders: () => apiRequest('/orders/my'),
  getById: (id) => apiRequest(`/orders/${id}`)
};

// ── Payment Services ──
export const paymentService = {
  createIntent: (payload) => apiRequest('/payments/intent', { method: 'POST', body: payload }),
  verifyPayment: (payload) => apiRequest('/payments/verify', { method: 'POST', body: payload }),
  simulateWebhook: (paymentCode, eventType = 'payment.captured') =>
    apiRequest('/payments/simulate-webhook', { method: 'POST', body: { payment_code: paymentCode, event_type: eventType } }),
  getByCode: (paymentCode) => apiRequest(`/payments/${paymentCode}`),
  getMyPayments: () => apiRequest('/payments/my')
};

// ── Refund & Cancellation Policy Services ──
export const refundService = {
  getCancellationPolicy: () => apiRequest('/refunds/policy'),
  requestRefund: (payload) => apiRequest('/refunds/request', { method: 'POST', body: payload }),
  getMyRefunds: () => apiRequest('/refunds/my')
};

// ── Admin Services ──
export const adminService = {
  getMetrics: () => apiRequest('/admin/metrics'),
  getRefunds: () => apiRequest('/admin/refunds'),
  reviewRefund: (id, status, admin_notes) => apiRequest(`/admin/refunds/${id}/review`, { method: 'PUT', body: { status, admin_notes } })
};
