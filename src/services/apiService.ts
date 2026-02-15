// src/services/apiService.ts

import { authService } from './authService';
import type { Account, User } from '@/types/models';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7777/api';

class ApiService {
  /**
   * Hacer petición GET autenticada
   */
  private async fetchWithAuth<T>(url: string): Promise<T> {
    const response = await fetch(url, {
      method: 'GET',
      headers: authService.getAuthHeaders(),
    });

    if (response.status === 401) {
      // Token inválido o expirado
      authService.logout();
      throw new Error('Sesión expirada. Por favor, inicia sesión de nuevo.');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
      throw new Error(error.message || `Error ${response.status}`);
    }

    return response.json();
  }

  /**
   * Hacer petición POST autenticada
   */
  private async postWithAuth<T>(url: string, body: any): Promise<T> {
    const response = await fetch(url, {
      method: 'POST',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(body),
    });

    if (response.status === 401) {
      authService.logout();
      throw new Error('Sesión expirada. Por favor, inicia sesión de nuevo.');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
      throw new Error(error.message || `Error ${response.status}`);
    }

    return response.json();
  }

  /**
   * Hacer petición PUT autenticada
   */
  private async putWithAuth<T>(url: string, body: any): Promise<T> {
    const response = await fetch(url, {
      method: 'PUT',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(body),
    });

    if (response.status === 401) {
      authService.logout();
      throw new Error('Sesión expirada. Por favor, inicia sesión de nuevo.');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
      throw new Error(error.message || `Error ${response.status}`);
    }

    // PUT puede devolver 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // ==================== USERS ====================

  /**
   * GET /api/User/{userId}
   */
  async getUser(userId: number): Promise<User> {
    console.log(`📡 GET /api/User/${userId}`);
    return this.fetchWithAuth<User>(`${API_BASE_URL}/User/${userId}`);
  }

  /**
   * GET /api/User?email={email}
   * Buscar usuario por email usando query parameter
   */
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      console.log(`📡 GET /api/User?email=${email}`);
      
      const response = await fetch(`${API_BASE_URL}/User?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: authService.getAuthHeaders(),
      });

      if (response.status === 401) {
        authService.logout();
        throw new Error('Sesión expirada. Por favor, inicia sesión de nuevo.');
      }

      if (!response.ok) {
        // Si es 404 o cualquier otro error, el usuario no existe
        console.log('❌ Usuario no encontrado o error en la petición');
        return null;
      }

      const users = await response.json();
      
      // El backend devuelve una lista, tomar el primer usuario
      if (Array.isArray(users) && users.length > 0) {
        console.log('✅ Usuario encontrado:', users[0].name);
        return users[0];
      }
      
      console.log('❌ Usuario no encontrado');
      return null;
      
    } catch (error) {
      console.error('❌ Error buscando usuario por email:', error);
      return null;
    }
  }

  /**
   * GET /api/User/{userId}/accounts
   */
  async getUserAccounts(userId: number): Promise<Account[]> {
    console.log(`📡 GET /api/User/${userId}/accounts`);
    const accounts = await this.fetchWithAuth<Account[]>(`${API_BASE_URL}/User/${userId}/accounts`);
    
    return accounts;
  }

  // ==================== ACCOUNTS ====================

  /**
   * GET /api/Account/{accountId}
   */
  async getAccount(accountId: number): Promise<Account> {
    console.log(`📡 GET /api/Account/${accountId}`);
    return this.fetchWithAuth<Account>(`${API_BASE_URL}/Account/${accountId}`);
  }

  /**
   * GET /api/Account/{accountId}/users
   */
  async getAccountMembers(accountId: number): Promise<User[]> {
    console.log(`📡 GET /api/Account/${accountId}/users`);
    return this.fetchWithAuth<User[]>(`${API_BASE_URL}/Account/${accountId}/users`);
  }

  /**
   * POST /api/Account (crear cuenta conjunta)
   */
  async createJointAccount(data: {
    name: string;
    user_emails: string[];
  }): Promise<void> {
    console.log('📡 POST /api/Account', data);
    return this.postWithAuth<void>(`${API_BASE_URL}/Account`, data);
  }

  /**
   * PUT /api/Account/{accountId}
   */
  async updateAccount(accountId: number, data: {
    name?: string;
    weekly_budget?: number;
    monthly_budget?: number;
    account_picture_url?: string;
  }): Promise<void> {
    console.log(`📡 PUT /api/Account/${accountId}`, data);
    return this.putWithAuth<void>(`${API_BASE_URL}/Account/${accountId}`, data);
  }
}

export const apiService = new ApiService();