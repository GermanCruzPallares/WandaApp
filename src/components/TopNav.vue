<template>
  <div class="header-nav">
    <div class="header-nav__logo">
      <img src="../images/OscuroReducido.png" alt="Logo" class="logo-image" />
    </div>
    
    <div class="header-nav__avatar">
      <img 
        :src="currentAvatar" 
        alt="User avatar"
        class="avatar-image"
        @click="handleAvatarClick"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export interface Account {
  id: string;
  name: string;
  avatar: string;
  isActive: boolean;
}

interface Props {
  accounts?: Account[];
}

const props = withDefaults(defineProps<Props>(), {
  accounts: () => []
});

const emit = defineEmits<{
  avatarClick: [];
}>();

const currentAvatar = computed(() => {
  const activeAccount = props.accounts.find(acc => acc.isActive);
  return activeAccount?.avatar || 'https://i.pravatar.cc/150?img=5';
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
</style>