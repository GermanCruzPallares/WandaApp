// Tipos que coinciden exactamente con el backend

export interface User {
  user_id: number;
  name: string;
  email: string;
  password?: string; // Opcional en frontend
}

export interface Account {
  account_id: number;
  name: string;
  account_type: 'personal' | 'joint';
  amount: number;
  weekly_budget: number;
  monthly_budget: number;
  account_picture_url: string;
  creation_date: Date | string;
}

export interface UserAccount {
  user_id: number;
  account_id: number;
  joined_at: Date | string;
}

// Tipo extendido SOLO para la UI (con estado local)
export interface AccountUI extends Account {
  isActive: boolean; // Solo para saber cuál está seleccionada en el frontend
}