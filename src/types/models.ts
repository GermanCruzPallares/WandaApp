// Tipos que coinciden exactamente con el backend

export interface User {
  user_id: number
  name: string
  email: string
  password?: string
}

export interface Account {
  account_id: number
  name: string
  account_type: 'personal' | 'joint'
  amount: number
  weekly_budget: number
  monthly_budget: number
  account_picture_url: string
  creation_date: Date | string
}

export interface UserAccount {
  user_id: number
  account_id: number
  joined_at: Date | string
}

// Tipo extendido SOLO para la UI
export interface AccountUI extends Account {
  isActive: boolean
}

// Tipos de transacciones
export type TransactionType = 'expense' | 'income' | 'saving'
export type FrequencyType = 'weekly' | 'monthly' | 'yearly' | null
export type SplitType = null | 'individual' | 'contribution' | 'divided'

export interface Transaction {
  transaction_id: number
  account_id: number
  user_id: number
  objective_id: number // 0 si no está asociado a objetivo
  category: string
  amount: number
  transaction_type: TransactionType
  concept: string | null
  transaction_date: Date | string
  isRecurring: boolean
  frequency: FrequencyType
  end_date: Date | string | null
  split_type: SplitType
  last_execution_date: Date | string | null
}

// Objetivo
export interface Objective {
  objective_id: number
  account_id: number
  name: string
  target_amount: number
  current_save: number
  deadline: Date | string
  objective_picture_url: string
}
