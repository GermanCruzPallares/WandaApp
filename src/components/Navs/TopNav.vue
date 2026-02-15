<template>
  <div class="header-nav">
    <div class="header-nav__logo">
      <img src="../../images/OscuroReducido.png" alt="Logo" class="logo-image" />
    </div>
    
    <!-- Estado de carga -->
    <div v-if="isLoading" class="header-nav__avatar header-nav__avatar--loading">
      <div class="skeleton-avatar"></div>
    </div>

    <!-- Avatar cargado -->
    <div v-else class="header-nav__avatar">
      <img 
        :src="avatarSrc" 
        alt="User avatar"
        class="avatar-image"
        @click="handleAvatarClick"
      />
    </div> 
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useAccountStore } from '@/stores/AccountStore';
import { getAvatarDataUrl } from '@/components/icons/AvatarIcons';
import type { Account } from '@/types/models';

interface Props {
  accountId?: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  avatarClick: [];
  accountLoaded: [account: Account];
}>();

// ✅ Usar el store de Pinia
const accountStore = useAccountStore();

// Estado local
const account = ref<Account | null>(null);
const isLoading = ref(false);

// ✅ NUEVA LÓGICA: Obtener avatar con fallback automático
const avatarSrc = computed(() => {
  if (!account.value) return getAvatarDataUrl('personal');
  
  // Si hay imagen personalizada, usarla
  if (account.value.account_picture_url) {
    return account.value.account_picture_url;
  }
  
  // Si no, usar avatar por defecto según tipo de cuenta
  const accountType = account.value.account_type || 'personal';
  return getAvatarDataUrl(accountType);
});

// ✅ Cargar cuenta desde el store
const loadAccount = async (accountId: number) => {
  isLoading.value = true;
  
  account.value = await accountStore.fetchAccount(accountId);
  
  if (account.value) {
    emit('accountLoaded', account.value);
  }
  
  isLoading.value = false;
};

// Cargar cuando se monta
onMounted(() => {
  if (props.accountId) {
    loadAccount(props.accountId);
  }
});

// Recargar cuando cambia la cuenta
watch(() => props.accountId, (newAccountId) => {
  if (newAccountId) {
    loadAccount(newAccountId);
  }
});

const handleAvatarClick = () => {
  emit('avatarClick');
};
</script>

<style scoped lang="scss">
.header-nav {
  position: fixed;  
  top: 0;            
  left: 0;           
  width: 100%;       
  z-index: 1000;     
  box-sizing: border-box;
  background-color: #e5e5e5;
  padding: 20px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  
  &__logo {
    .logo-image {
      width: 40px;
      height: 40px;
      display: block;
      border-radius: 8px;
    }
  }
  
  &__avatar {
    cursor: pointer;
    transition: transform 0.2s ease;

    &:hover {
      transform: scale(1.05);
    }

    &:active {
      transform: scale(0.95);
    }

    &--loading {
      cursor: default;

      &:hover {
        transform: none;
      }
    }
    
    .avatar-image {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      display: block;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  }
}

.skeleton-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>