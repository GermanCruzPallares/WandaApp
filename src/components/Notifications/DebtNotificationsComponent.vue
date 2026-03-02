<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useTransactionSplitStore } from '@/stores/TransactionSplitStore';
import { useTransactionStore } from '@/stores/TransactionStore';
import { useAccountStore } from '@/stores/AccountStore';
import { apiService } from '@/services/apiService';
import { getAvatarDataUrl } from '@/components/icons/AvatarIcons';
import type { TransactionSplit, Transaction, User, Account } from '@/types/models';

// ==================== PROPS ====================

interface Props {
  userId: number;
}

const props = defineProps<Props>();

// ==================== STORES ====================

const splitStore = useTransactionSplitStore();
const transactionStore = useTransactionStore();
const accountStore = useAccountStore();

// ==================== TIPOS ====================

interface DebtNotification {
  split: TransactionSplit;
  transaction: Transaction;
  account: Account | null;
  creditor: User | null;
}

// ==================== ESTADO ====================

const notifications = ref<DebtNotification[]>([]);
const isLoading = ref(false);
const processingIds = ref<Set<number>>(new Set());
const errorMessage = ref('');
const successMessage = ref('');

// ==================== CARGA DE DATOS ====================

const loadNotifications = async () => {
  if (!props.userId) return;

  isLoading.value = true;
  errorMessage.value = '';

  try {
    const pendingSplits = await splitStore.fetchUserSplits(props.userId, 'pending');

    const enriched: DebtNotification[] = [];

    for (const split of pendingSplits) {
      try {
        const transaction = await transactionStore.fetchTransactionById(split.transaction_id);
        if (!transaction) continue;

        const account = await accountStore.fetchAccount(transaction.account_id);

        let creditor: User | null = null;
        try {
          creditor = await apiService.getUser(transaction.user_id);
        } catch {
          creditor = null;
        }

        enriched.push({ split, transaction, account, creditor });
      } catch (err) {
        console.error(`Error enriqueciendo split ${split.split_id}:`, err);
      }
    }

    notifications.value = enriched;
  } catch (error) {
    console.error('Error cargando deudas pendientes:', error);
    errorMessage.value = 'Error al cargar las notificaciones';
  } finally {
    isLoading.value = false;
  }
};

// ==================== ACCIONES ====================

const handleAcceptDebt = async (splitId: number) => {
  processingIds.value.add(splitId);
  errorMessage.value = '';
  successMessage.value = '';

  try {
    await splitStore.acceptDebt(splitId);

    successMessage.value = 'Deuda aceptada correctamente';
    notifications.value = notifications.value.filter(n => n.split.split_id !== splitId);

    setTimeout(() => { successMessage.value = ''; }, 3000);
  } catch (error: any) {
    errorMessage.value = error.message || 'Error al aceptar la deuda';
    setTimeout(() => { errorMessage.value = ''; }, 4000);
  } finally {
    processingIds.value.delete(splitId);
  }
};

const handleRejectDebt = (splitId: number) => {
  notifications.value = notifications.value.filter(n => n.split.split_id !== splitId);
};

// ==================== HELPERS ====================

const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const getCreditorAvatar = (_notification: DebtNotification): string => {
  return getAvatarDataUrl('personal');
};

const getSubtitle = (notification: DebtNotification): string => {
  const parts: string[] = [];
  if (notification.account?.name) parts.push(notification.account.name);
  if (notification.creditor?.name) parts.push(notification.creditor.name);
  return parts.join(' · ');
};

const isProcessing = (splitId: number): boolean => {
  return processingIds.value.has(splitId);
};

const hasNotifications = computed(() => notifications.value.length > 0);

// ==================== LIFECYCLE ====================

onMounted(() => loadNotifications());

watch(() => props.userId, (newId) => {
  if (newId) loadNotifications();
});
</script>

<template>
  <div class="debt-notifications">
    <!-- Mensajes de estado -->
    <Transition name="toast">
      <div v-if="successMessage" class="toast toast--success">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        {{ successMessage }}
      </div>
    </Transition>

    <Transition name="toast">
      <div v-if="errorMessage" class="toast toast--error">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        {{ errorMessage }}
      </div>
    </Transition>

    <!-- Loading -->
    <div v-if="isLoading" class="debt-notifications__loading">
      <div class="spinner"></div>
      <p>Cargando notificaciones...</p>
    </div>

    <!-- Lista de deudas -->
    <TransitionGroup v-else-if="hasNotifications" name="notification" tag="div" class="debt-notifications__list">
      <div
        v-for="notification in notifications"
        :key="notification.split.split_id"
        class="debt-card"
      >
        <div class="debt-card__main">
          <img
            :src="getCreditorAvatar(notification)"
            :alt="notification.creditor?.name || 'Usuario'"
            class="debt-card__avatar"
          />

          <div class="debt-card__info">
            <span class="debt-card__title">Solicitud gasto</span>
            <span class="debt-card__subtitle">{{ getSubtitle(notification) }}</span>
          </div>

          <span class="debt-card__amount">
            -{{ formatAmount(notification.split.amount_assigned) }} €
          </span>
        </div>

        <div class="debt-card__actions">
          <button
            class="debt-card__btn debt-card__btn--reject"
            :disabled="isProcessing(notification.split.split_id)"
            @click="handleRejectDebt(notification.split.split_id)"
          >
            Rechazar
          </button>
          <button
            class="debt-card__btn debt-card__btn--accept"
            :disabled="isProcessing(notification.split.split_id)"
            @click="handleAcceptDebt(notification.split.split_id)"
          >
            {{ isProcessing(notification.split.split_id) ? 'Procesando...' : 'Confirmar' }}
          </button>
        </div>
      </div>
    </TransitionGroup>

    <!-- Estado vacío -->
    <div v-else class="debt-notifications__empty">
      <div class="debt-notifications__empty-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <p>No tienes notificaciones pendientes</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/base/variables.scss';

.debt-notifications {

  // ==================== TOASTS ====================

  .toast {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    padding: 10px 14px;
    border-radius: $small-border-radius;
    font-size: 13px;
    font-weight: 500;

    &--success {
      background-color: $bg-success;
      color: $bg-success-text;
    }

    &--error {
      background-color: $bg-danger;
      color: $bg-danger-text;
    }
  }

  .toast-enter-active { transition: all 0.3s ease; }
  .toast-leave-active { transition: all 0.2s ease; }
  .toast-enter-from { opacity: 0; transform: translateY(-8px); }
  .toast-leave-to { opacity: 0; transform: translateY(-4px); }

  // ==================== LOADING ====================

  &__loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 60px 20px;

    p {
      margin: 0;
      font-size: 14px;
      color: $color-text-gray;
    }
  }

  .spinner {
    width: 28px;
    height: 28px;
    border: 3px solid #e0e0e0;
    border-top-color: $color-text;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  // ==================== LISTA ====================

  &__list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  // ==================== EMPTY STATE ====================

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 80px 20px;

    &-icon {
      color: #d0d0d0;
    }

    p {
      margin: 0;
      font-size: 14px;
      color: $color-text-gray;
    }
  }

  // ==================== ANIMACIONES LISTA ====================

  .notification-enter-active { transition: all 0.3s ease; }
  .notification-leave-active { transition: all 0.2s ease; }
  .notification-enter-from { opacity: 0; transform: translateY(10px); }
  .notification-leave-to { opacity: 0; transform: translateX(30px); }
  .notification-move { transition: transform 0.3s ease; }
}

// ==================== DEBT CARD ====================

.debt-card {
  background-color: $section-bg-primary;
  border-radius: $card-border-radius;
  padding: 20px;

  &__main {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 16px;
  }

  &__avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }

  &__info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__title {
    font-size: 15px;
    font-weight: 600;
    color: $color-text;
  }

  &__subtitle {
    font-size: 12px;
    color: $color-text-gray;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__amount {
    font-size: 16px;
    font-weight: 600;
    color: $color-danger;
    flex-shrink: 0;
  }

  &__actions {
    display: flex;
    gap: 10px;
  }

  &__btn {
    flex: 1;
    padding: 10px 16px;
    border-radius: 50px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity $transition-speed $transition-ease;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &--reject {
      background-color: transparent;
      border: 1.5px solid #d4d4d4;
      color: $color-text;

      &:hover:not(:disabled) { background-color: $section-bg-secondary; }
      &:active:not(:disabled) { transform: scale(0.98); }
    }

    &--accept {
      background-color: $color-text--dk;
      border: none;
      color: $color-white;

      &:hover:not(:disabled) { opacity: 0.88; }
      &:active:not(:disabled) { transform: scale(0.98); }
    }
  }
}
</style>