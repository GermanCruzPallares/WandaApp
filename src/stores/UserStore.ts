import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { Account, User } from '@/types/models';
import { useRouter } from 'vue-router';

export const useUserStore = defineStore('user', () => {

  const router = useRouter();


  const token = ref(localStorage.getItem('token') || '');

  const login = async (email: string, password: string) => {
    try {
      const url = 'https://localhost:7085/api/Auth/login';
      console.log(`🔵 [LOGIN] Enviando petición a: ${url}`);

      const response = await fetch(url, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }), // Coincide con LoginDto.cs
      });

      console.log(`🔵 [LOGIN] Estado de respuesta HTTP: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`🔴 [LOGIN] Error del servidor:`, errorText);
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      // Guardar token y usuario
      token.value = data.token;
      localStorage.setItem('token', data.token); // Persistencia
      localStorage.setItem('userId', data.userId);
      
      // Redirigir al home
      router.push('/home');
      return true;

    } catch (error) {
      console.error(error);
      alert('Error al iniciar sesión: ' + error);
      return false;
    }
  };

  // ✅ Estado: Map para cachear cuentas de cada usuario
  const accountsByUser = ref<Map<number, Account[]>>(new Map());

  // ✅ Obtener todas las cuentas de un usuario
  const fetchUserAccounts = async (userId: number): Promise<Account[]> => {
    // Si ya están en caché, devolverlas
    if (accountsByUser.value.has(userId)) {
      return accountsByUser.value.get(userId)!;
    }

    // TODO: Fetch real cuando tengas backend
    // const response = await fetch(`/api/users/${userId}/accounts`);
    // const accounts = await response.json();
    // accountsByUser.value.set(userId, accounts);
    // return accounts;

    // Mock temporal
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const mockUserAccounts: Record<number, Account[]> = {
      1: [
        {
          account_id: 1,
          name: 'Clara',
          account_type: 'personal',
          amount: 13789.37,
          weekly_budget: 200,
          monthly_budget: 2000,
          account_picture_url: 'https://i.pravatar.cc/150?img=5',
          creation_date: new Date()
        },
        {
          account_id: 2,
          name: 'Casa Clara y Juan',
          account_type: 'joint',
          amount: 5200.00,
          weekly_budget: 300,
          monthly_budget: 1500,
          account_picture_url: 'https://i.pravatar.cc/150?img=8',
          creation_date: new Date()
        },
        {
          account_id: 3,
          name: 'Vacaciones Familia',
          account_type: 'joint',
          amount: 3400.00,
          weekly_budget: 150,
          monthly_budget: 800,
          account_picture_url: 'https://i.pravatar.cc/150?img=12',
          creation_date: new Date()
        }
      ]
    };

    const accounts = mockUserAccounts[userId] || [];
    
    accountsByUser.value.set(userId, accounts);
    
    return accounts;
  };

  // ✅ Obtener usuarios de una cuenta (para cuentas conjuntas)
  const fetchAccountUsers = async (accountId: number): Promise<User[]> => {
    // TODO: Fetch real cuando tengas backend
    // const response = await fetch(`/api/accounts/${accountId}/users`);
    // const users = await response.json();
    // return users;

    // Mock temporal
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const mockAccountUsers: Record<number, User[]> = {
      2: [ // Casa Clara y Juan
        { user_id: 1, name: 'Clara', email: 'clara@wandaapp.com' },
        { user_id: 2, name: 'Juan', email: 'juan@wandaapp.com' }
      ],
      3: [ // Vacaciones Familia
        { user_id: 1, name: 'Clara', email: 'clara@wandaapp.com' },
        { user_id: 2, name: 'Juan', email: 'juan@wandaapp.com' },
        { user_id: 4, name: 'Pedro', email: 'pedro@wandaapp.com' }
      ]
    };
    
    return mockAccountUsers[accountId] || [];
  };

  // ✅ Verificar si un usuario existe (para CreateJointAccountModal)
  const checkUserExists = async (email: string): Promise<User | null> => {
    // TODO: Fetch real cuando tengas backend
    // const response = await fetch(`/api/users/check?email=${encodeURIComponent(email)}`);
    // if (!response.ok) return null;
    // const data = await response.json();
    // return data.user;

    // Mock temporal
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockUsers: Record<string, User> = {
      'juan@wandaapp.com': { user_id: 2, name: 'Juan', email: 'juan@wandaapp.com' },
      'ana@wandaapp.com': { user_id: 3, name: 'Ana', email: 'ana@wandaapp.com' },
      'pedro@wandaapp.com': { user_id: 4, name: 'Pedro', email: 'pedro@wandaapp.com' }
    };
    
    return mockUsers[email.toLowerCase()] || null;
  };

  return {
    token,
    login,
    accountsByUser,
    fetchUserAccounts,
    fetchAccountUsers,
    checkUserExists
  };
});