// src/services/apiService.ts

import { authService } from './authService'
import type { Account, User, Transaction, Objective } from '@/types/models'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7777/api'

class ApiService {
  // ==================== MÉTODOS PRIVADOS (HTTP) ====================

  private async fetchWithAuth<T>(url: string): Promise<T> {
    const response = await fetch(url, {
      method: 'GET',
      headers: authService.getAuthHeaders(),
    })

    if (response.status === 401) {
      authService.logout()
      throw new Error('Sesión expirada. Por favor, inicia sesión de nuevo.')
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error desconocido' }))
      throw new Error(error.message || `Error ${response.status}`)
    }

    return response.json()
  }

  private async postWithAuth<T>(url: string, body: any): Promise<T> {
    console.log('🔵 POST Request:', url)
    console.log('📦 Payload:', JSON.stringify(body, null, 2))

    const response = await fetch(url, {
      method: 'POST',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(body),
    })

    if (response.status === 401) {
      authService.logout()
      throw new Error('Sesión expirada. Por favor, inicia sesión de nuevo.')
    }

    if (!response.ok) {
      let errorDetails = 'Error desconocido'
      try {
        const errorBody = await response.text()
        console.error('❌ Response body:', errorBody)
        try {
          const errorJson = JSON.parse(errorBody)
          errorDetails = errorJson.message || errorJson.title || JSON.stringify(errorJson)
        } catch {
          errorDetails = errorBody
        }
      } catch (e) {
        console.error('❌ No se pudo leer el cuerpo de la respuesta:', e)
      }
      throw new Error(`Error ${response.status}: ${errorDetails}`)
    }

    if (response.status === 204) {
      console.log('✅ 204 No Content - Operación exitosa')
      return {} as T
    }
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text()
      console.log('✅ Respuesta de texto:', textResponse)
      return {} as T // Devolver objeto vacío si es texto plano
    }

    return response.json()
  }

  private async putWithAuth<T>(url: string, body: any): Promise<T> {
    // ✅ LOG: Ver qué estamos enviando
    console.log('🔵 PUT Request:', url)
    console.log('📦 Payload:', JSON.stringify(body, null, 2))

    const response = await fetch(url, {
      method: 'PUT',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(body),
    })

    if (response.status === 401) {
      authService.logout()
      throw new Error('Sesión expirada. Por favor, inicia sesión de nuevo.')
    }

    if (!response.ok) {
      // ✅ Capturar el error completo del backend
      let errorDetails = 'Error desconocido'
      try {
        const errorBody = await response.text()
        console.error('❌ Response body:', errorBody)

        // Intentar parsear como JSON
        try {
          const errorJson = JSON.parse(errorBody)
          errorDetails = errorJson.message || errorJson.title || JSON.stringify(errorJson)
        } catch {
          errorDetails = errorBody
        }
      } catch (e) {
        console.error('❌ No se pudo leer el cuerpo de la respuesta:', e)
      }

      throw new Error(`Error ${response.status}: ${errorDetails}`)
    }

    if (response.status === 204) {
      return {} as T
    }

    return response.json()
  }

  private async deleteWithAuth<T>(url: string): Promise<T> {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: authService.getAuthHeaders(),
    })

    if (response.status === 401) {
      authService.logout()
      throw new Error('Sesión expirada. Por favor, inicia sesión de nuevo.')
    }

    if (response.status === 204) {
      return {} as T
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error desconocido' }))
      throw new Error(error.message || `Error ${response.status}`)
    }

    return response.json()
  }

  // ==================== USERS ====================

  async getUser(userId: number): Promise<User> {
    return this.fetchWithAuth<User>(`${API_BASE_URL}/User/${userId}`)
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/User?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: authService.getAuthHeaders(),
      })

      if (response.status === 401) {
        authService.logout()
        throw new Error('Sesión expirada. Por favor, inicia sesión de nuevo.')
      }

      if (!response.ok) {
        return null
      }

      const users = await response.json()
      return Array.isArray(users) && users.length > 0 ? users[0] : null
    } catch (error) {
      console.error('❌ Error buscando usuario por email:', error)
      return null
    }
  }

  async getUserAccounts(userId: number): Promise<Account[]> {
    return this.fetchWithAuth<Account[]>(`${API_BASE_URL}/User/${userId}/accounts`)
  }

  // ==================== ACCOUNTS ====================

  async getAccount(accountId: number): Promise<Account> {
    return this.fetchWithAuth<Account>(`${API_BASE_URL}/Account/${accountId}`)
  }

  async getAccountMembers(accountId: number): Promise<User[]> {
    return this.fetchWithAuth<User[]>(`${API_BASE_URL}/Account/${accountId}/users`)
  }

  async createJointAccount(data: { name: string; member_Ids: number[] }): Promise<void> {
    console.log('📡 POST /api/Account')
    console.log('📦 Payload:', JSON.stringify(data, null, 2))
    return this.postWithAuth<void>(`${API_BASE_URL}/Account`, data)
  }

  async updateAccount(accountId: number, data: Partial<Account>): Promise<void> {
    // ✅ IMPORTANTE: El backend requiere estos campos siempre
    const updatePayload = {
      name: data.name || '',
      amount: data.amount ?? 0, // ✅ Incluir saldo
      weekly_budget: data.weekly_budget ?? 0,
      monthly_budget: data.monthly_budget ?? 0,
      account_picture_url: data.account_picture_url ?? '', // ✅ Campo obligatorio en el backend
    }

    console.log('🔵 updateAccount llamado con:', updatePayload)

    return this.putWithAuth<void>(`${API_BASE_URL}/Account/${accountId}`, updatePayload)
  }

  // ==================== TRANSACTIONS ====================

  async getAccountTransactions(accountId: number): Promise<Transaction[]> {
    return this.fetchWithAuth<Transaction[]>(`${API_BASE_URL}/accounts/${accountId}/transactions`)
  }

  async createTransaction(accountId: number, data: Partial<Transaction>): Promise<Transaction> {
    return this.postWithAuth<Transaction>(
      `${API_BASE_URL}/accounts/${accountId}/transactions`,
      data,
    )
  }

  async getTransaction(transactionId: number): Promise<Transaction> {
    return this.fetchWithAuth<Transaction>(`${API_BASE_URL}/transactions/${transactionId}`)
  }

  async updateTransaction(transactionId: number, data: Partial<Transaction>): Promise<void> {
    return this.putWithAuth<void>(`${API_BASE_URL}/transactions/${transactionId}`, data)
  }

  async deleteTransaction(transactionId: number): Promise<void> {
    return this.deleteWithAuth<void>(`${API_BASE_URL}/transactions/${transactionId}`)
  }

  // ==================== OBJECTIVES ====================

  async getAccountObjectives(accountId: number): Promise<Objective[]> {
    return this.fetchWithAuth<Objective[]>(`${API_BASE_URL}/Account/${accountId}/objectives`)
  }

  async createObjective(accountId: number, data: Partial<Objective>): Promise<Objective> {
    return this.postWithAuth<Objective>(`${API_BASE_URL}/Account/${accountId}/objectives`, data)
  }

  async getObjective(objectiveId: number): Promise<Objective> {
    return this.fetchWithAuth<Objective>(`${API_BASE_URL}/objectives/${objectiveId}`)
  }

  async updateObjective(objectiveId: number, data: Partial<Objective>): Promise<void> {
    return this.putWithAuth<void>(`${API_BASE_URL}/${objectiveId}`, data)
  }

  async deleteObjective(objectiveId: number): Promise<void> {
    return this.deleteWithAuth<void>(`${API_BASE_URL}/objectives/${objectiveId}`)
  }
}

export const apiService = new ApiService()
