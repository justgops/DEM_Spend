const API_BASE_URL = 'http://localhost:3001/api';

export const api = {
  // Accounts
  accounts: {
    getAll: async () => {
      const res = await fetch(`${API_BASE_URL}/accounts`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to load accounts')
      return json
    },
    create: async (data) => {
      const res = await fetch(`${API_BASE_URL}/accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to create account')
      return json
    },
    update: async (id, data) => {
      const res = await fetch(`${API_BASE_URL}/accounts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to update account')
      return json
    },
    delete: async (id) => {
      const res = await fetch(`${API_BASE_URL}/accounts/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to delete account')
      return json
    }
  },

  // Transactions
  transactions: {
    getAll: async () => {
      const res = await fetch(`${API_BASE_URL}/transactions`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to load transactions')
      return json
    },
    getByAccount: async (accountId) => {
      const res = await fetch(`${API_BASE_URL}/transactions/account/${accountId}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to load account transactions')
      return json
    },
    create: async (data) => {
      const res = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to create transaction')
      return json
    },
    update: async (id, data) => {
      const res = await fetch(`${API_BASE_URL}/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to update transaction')
      return json
    },
    delete: async (id) => {
      const res = await fetch(`${API_BASE_URL}/transactions/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to delete transaction')
      return json
    }
  },

  // Expenses
  expenses: {
    getAll: () => fetch(`${API_BASE_URL}/expenses`).then(r => r.json()),
    getByRange: (start, end) => fetch(`${API_BASE_URL}/expenses/range/${start}/${end}`).then(r => r.json()),
    getByCategory: (category) => fetch(`${API_BASE_URL}/expenses/category/${category}`).then(r => r.json()),
    delete: (id) => fetch(`${API_BASE_URL}/expenses/${id}`, { method: 'DELETE' }).then(r => r.json())
  }
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount || 0)
};

export const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const getTimeAgo = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
};
