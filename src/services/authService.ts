import type { User } from '@/types/models';

interface LoginResponse {
  token: string;
  userId: number;
}

interface LoginCredentials {
  email: string;
  password: string;
}

class AuthService {
  private readonly TOKEN_KEY = 'wanda_auth_token';
  private readonly USER_ID_KEY = 'wanda_user_id';
  private readonly API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7085/api';


  async login(credentials: LoginCredentials): Promise<number> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/Auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Error al iniciar sesión' }));
        throw new Error(error.message || 'Usuario o contraseña incorrectos');
      }

      const data: LoginResponse = await response.json();


      this.setToken(data.token);
      this.setUserId(data.userId);

      console.log('Login exitoso. UserId:', data.userId);

      return data.userId;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }


  async register(userData: { name: string; email: string; password: string }): Promise<number> {
    try {

      const response = await fetch(`${this.API_BASE_URL}/Auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Error al registrarse' }));
        throw new Error(error.message || 'Error al registrarse');
      }

      return await this.login({
        email: userData.email,
        password: userData.password
      });
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_ID_KEY);
    window.location.href = '/login';
  }


  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }


  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Obtener userId actual
   */
  getUserId(): number | null {
    const userId = localStorage.getItem(this.USER_ID_KEY);
    return userId ? parseInt(userId) : null;
  }

  /**
   * Guardar userId
   */
  private setUserId(userId: number): void {
    localStorage.setItem(this.USER_ID_KEY, userId.toString());
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getUserId();
  }

  /**
   * Obtener headers con autenticación
   */
  getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }
}

export const authService = new AuthService();