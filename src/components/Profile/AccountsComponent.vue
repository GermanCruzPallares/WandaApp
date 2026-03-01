<script setup lang="ts">
import { useUserStore } from '@/stores/UserStore';
import { computed } from 'vue';
import SectionTitle from '@/components/SectionTitle.vue';
import { getAvatarDataUrl } from '@/components/icons/AvatarIcons';

const userStore = useUserStore();

const myAccounts = computed(() => userStore.accounts);

const getAccountAvatar = (account: any) => {
  if (account.account_picture_url) {
    return account.account_picture_url;
  }
  return getAvatarDataUrl(account.account_type || 'personal');
};
</script>

<template>
  <div class="accounts-section">
    <SectionTitle :title="`| Cuentas (${myAccounts.length})`" />

    <div class="account-list">
      <div 
        v-for="account in myAccounts" 
        :key="account.account_id"
        class="account-item"
      >
        <img 
          :src="getAccountAvatar(account)" 
          :alt="account.name"
          class="account-avatar"
        />
        <span class="account-name">{{ account.name }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/base/variables.scss';

.accounts-section {
  
  @media (min-width: 768px) {
    padding: 0;
  }
}

.account-list {
  padding: 0 $section-margin-horizontal;
  display: flex;
  flex-direction: column;
  gap: $section-gap;
  margin-top: 1rem;

}

.account-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 1.25rem;
  background-color: $section-bg-primary;
  border-radius: $card-border-radius;
  cursor: pointer;
  transition: transform $transition-speed $transition-ease,
              background-color $transition-speed $transition-ease;

}

.account-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.account-name {
  font-size: 16px;
  font-weight: 500;
  color: $color-text;
}
</style>