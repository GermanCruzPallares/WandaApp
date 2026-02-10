<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click="handleClose">
        <Transition name="slide">
          <div v-if="isOpen" class="modal-drawer" @click.stop>
            <!-- Lista de cuentas -->
            <div class="accounts-list">
              <div
                v-for="account in accounts"
                :key="account.id"
                class="account-item"
                :class="{ 'account-item--active': account.isActive }"
                @click="handleSelectAccount(account.id)"
              >
                <div class="account-item__wrapper">
                  <div class="account-item__avatar">
                    <img :src="account.avatar" :alt="account.name" />
                  </div>
                  <div class="account-item__info">
                    <span class="account-item__name">{{ account.name }}</span>
                  </div>
                  <div v-if="account.isActive" class="account-item__check">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" fill="#4285F4"/>
                      <path d="M7 12l3 3 7-7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Separador -->
              <div class="separator"></div>

              <!-- Botón añadir cuenta -->
              <button class="add-account-btn" @click="handleAddAccount">
                <div class="add-account-btn__wrapper">
                  <div class="add-account-btn__icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
                    </svg>
                  </div>
                  <span class="add-account-btn__text">Añadir cuenta conjunta</span>
                </div>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { watch } from 'vue';

export interface Account {
  id: string;
  name: string;
  avatar: string;
  isActive: boolean;
}

interface Props {
  isOpen: boolean;
  accounts: Account[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
  selectAccount: [accountId: string];
  addAccount: [];
}>();

const handleClose = () => {
  emit('close');
};

const handleSelectAccount = (accountId: string) => {
  emit('selectAccount', accountId);
  handleClose();
};

const handleAddAccount = () => {
  emit('addAccount');
  handleClose();
};

// Bloquear scroll cuando el modal está abierto
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});
</script>

<style scoped lang="scss">
@import '@/styles/base/variables.scss';

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1001;
  backdrop-filter: blur(2px);
}

.modal-drawer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: $color-white;
  border-radius: $section-border-radius $section-border-radius 0 0;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 1002;
}

.accounts-list {
  padding: 0;
}

.account-item {
  display: flex;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
  background-color: $color-white;
  padding: 16px 0;

  &:hover {
    background-color: rgba(0, 0, 0, 0.02);
  }

  &:active {
    background-color: rgba(0, 0, 0, 0.05);
  }

  &__wrapper {
    display: flex;
    align-items: center;
    gap: 16px;
    width: 100%;
    max-width: 70%;
    padding: 0 20px;
    margin: 0.5em 0;
  }

  &__avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
  }

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__name {
    font-size: 16px;
    font-weight: 400;
    color: $color-text;
    display: block;
  }

  &__check {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.separator {
  height: 1px;
  background-color: #e5e5e5;
  margin: 0;
}

.add-account-btn {
  display: flex;
  justify-content: center;
  width: 100%;
  border: none;
  background-color: $color-white;
  cursor: pointer;
  transition: background-color 0.2s ease;
  color: $color-text;
  padding: 16px 0;

  &:hover {
    background-color: rgba(0, 0, 0, 0.02);
  }

  &:active {
    background-color: rgba(0, 0, 0, 0.05);
  }

  &__wrapper {
    display: flex;
    align-items: center;
    gap: 16px;
    width: 100%;
    max-width: 70%;
    padding: 0 20px;
    margin: 0.5em 0;
  }

  &__icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: transparent;
    border: 2px solid #e5e5e5;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: $color-text;
  }

  &__text {
    font-size: 16px;
    font-weight: 400;
    text-align: left;
    color: $color-text;
  }
}

// Animaciones
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

// Animación del drawer desde abajo
.slide-enter-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-leave-active {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.6, 1);
}

.slide-enter-from {
  transform: translateY(100%);
}

.slide-leave-to {
  transform: translateY(100%);
}

.slide-enter-to {
  transform: translateY(0);
}
</style>