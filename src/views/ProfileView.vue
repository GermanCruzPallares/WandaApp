<script setup lang="ts">
import TopNav from '@/components/Navs/TopNav.vue';
import AsideNav from '@/components/Navs/AsideNav.vue';
import { computed, ref } from 'vue';
import type { Account, AccountUI, User } from '@/types/models';
import BottomNav from '@/components/Navs/BottomNav.vue';

const currentUser = ref<User>({
  user_id: 1,
  name: 'Clara',
  email: 'clara@wandaapp.com'
});

const accounts = ref<AccountUI[]>([
  {
    account_id: 1,
    name: 'Clara',
    account_type: 'personal',
    amount: 13789.37,
    weekly_budget: 200,
    monthly_budget: 2000,
    account_picture_url: 'https://i.pravatar.cc/150?img=5',
    creation_date: new Date(),
    isActive: true 
  }
]);


const activeAccount = computed(() => {
  const active = accounts.value.find(acc => acc.isActive);
  console.log('🔍 HomeView: activeAccount =', active); 
  return active;
});


const activeMenuItem = ref('inicio');


const handleNavigate = (itemId: string) => {
  activeMenuItem.value = itemId;
  console.log('Navegando a:', itemId);
};

const isAccountModalOpen = ref(false);
const handleAvatarClick = () => {
  isAccountModalOpen.value = true;
};


</script>


<template>

<AsideNav 
    :active-item="activeMenuItem"
    :account-id="activeAccount?.account_id"
    @navigate="handleNavigate"
    @avatar-click="handleAvatarClick"
  />
  
<TopNav 
    :account-id="activeAccount?.account_id"
    @avatar-click="handleAvatarClick"
    class="mobile-only"
  />

  <main class="profile-content">

  </main>

   <BottomNav class="mobile-only" />

</template>


<style scoped lang="scss">
.mobile-only {
  @media (min-width: 768px) {
    display: none;
  }
}
</style>