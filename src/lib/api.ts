const API_BASE_URL = 'https://buget-back-end.onrender.com/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const api = {
  auth: {
    register: async (email: string, password: string) => {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) throw new Error('Registration failed');
      return response.json();
    },
    login: async (email: string, password: string) => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) throw new Error('Login failed');
      return response.json();
    },
    me: async () => {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch user');
      return response.json();
    },
  },
  debts: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/debts`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch debts');
      return response.json();
    },
    create: async (debt: {
      amount: number;
      name: string;
      due_date: string;
      is_recurring: boolean;
      category: string;
    }) => {
      const response = await fetch(`${API_BASE_URL}/debts`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(debt),
      });
      if (!response.ok) throw new Error('Failed to create debt');
      return response.json();
    },
    updateStatus: async (id: number, status: string) => {
      const response = await fetch(`${API_BASE_URL}/debts/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update debt status');
      return response.json();
    },
    delete: async (id: number) => {
      const response = await fetch(`${API_BASE_URL}/debts/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to delete debt');
      return response.json();
    },
  },
  incomes: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/incomes`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch incomes');
      return response.json();
    },
    create: async (income: {
      amount: number;
      description: string;
      date: string;
      is_recurring: boolean;
    }) => {
      const response = await fetch(`${API_BASE_URL}/incomes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(income),
      });
      if (!response.ok) throw new Error('Failed to create income');
      return response.json();
    },
    delete: async (id: number) => {
      const response = await fetch(`${API_BASE_URL}/incomes/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to delete income');
      return response.json();
    },
  },
  transactions: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/transactions`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch transactions');
      return response.json();
    },
    create: async (transaction: {
      debt_id?: number;
      amount: number;
      date: string;
      note?: string;
    }) => {
      const response = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(transaction),
      });
      if (!response.ok) throw new Error('Failed to create transaction');
      return response.json();
    },
  },
  summary: {
    current: async () => {
      const response = await fetch(`${API_BASE_URL}/summary/current`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch current summary');
      return response.json();
    },
    next: async () => {
      const response = await fetch(`${API_BASE_URL}/summary/next`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch next month summary');
      return response.json();
    },
  },
};
