export interface User {
  id: number;
  email: string;
  created_at?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Debt {
  id: number;
  user_id: number;
  amount: number;
  name: string;
  due_date: string;
  is_recurring: number;
  category: string;
  status: 'pending' | 'paid' | 'overdue';
}

export interface Income {
  id: number;
  user_id: number;
  amount: number;
  description: string;
  date: string;
  is_recurring: number;
}

export interface Transaction {
  id: number;
  user_id: number;
  debt_id?: number;
  amount: number;
  date: string;
  note?: string;
}

export interface Summary {
  month: string;
  totalIncome: number;
  totalDebts: number;
  remaining: number;
  incomes: Income[];
  debts: Debt[];
}
