<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useAccountStore } from '@/stores/AccountStore';
import { useTransactionStore } from '@/stores/TransactionStore';
import { getAvatarDataUrl } from '@/components/icons/AvatarIcons';
import type { Account, User } from '@/types/models';

interface Props {
  accountId?: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  accountLoaded: [account: Account];
}>();

const accountStore = useAccountStore();
const transactionStore = useTransactionStore();

const account = ref<Account | null>(null);
const members = ref<User[]>([]);
const isLoading = ref(false);
const expensesByUser = ref<Map<number, number>>(new Map());

const loadData = async (accountId: number) => {
  isLoading.value = true;

  const [fetchedAccount, fetchedMembers] = await Promise.all([
    accountStore.fetchAccount(accountId),
    accountStore.fetchAccountMembers(accountId),
  ]);

  console.log('🏦 fetchedAccount:', JSON.stringify(fetchedAccount));
  console.log('👥 fetchedMembers:', JSON.stringify(fetchedMembers));
  console.log('🔢 accountId recibido:', accountId);

  account.value = fetchedAccount;
  members.value = fetchedMembers;

  if (fetchedAccount) emit('accountLoaded', fetchedAccount);

  await transactionStore.fetchTransactions(accountId);

  const transactions = transactionStore.getTransactionsFromCache(accountId);
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const map = new Map<number, number>();
  (transactions ?? [])
    .filter(t => {
      const d = new Date(t.transaction_date);
      return (
        t.transaction_type === 'expense' &&
        d.getMonth() === currentMonth &&
        d.getFullYear() === currentYear
      );
    })
    .forEach(t => map.set(t.user_id, (map.get(t.user_id) ?? 0) + t.amount));

  expensesByUser.value = map;
  isLoading.value = false;
};

onMounted(() => { if (props.accountId) loadData(props.accountId); });
watch(() => props.accountId, (id) => { if (id) loadData(id); });

const totalExpenses = computed(() =>
  Array.from(expensesByUser.value.values()).reduce((a, b) => a + b, 0)
);

const getPercentage = (userId: number): number => {
  if (totalExpenses.value === 0) return 0;
  return Math.round(((expensesByUser.value.get(userId) ?? 0) / totalExpenses.value) * 100);
};

const getExpense = (userId: number): string => {
  const amount = expensesByUser.value.get(userId) ?? 0;
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const getMemberAvatar = (_user: User): string => getAvatarDataUrl('personal');
</script>

<template>
  <div v-if="!isLoading && account !== null" class="joint-card">

    <div class="joint-card__header">
      <h2 class="joint-card__title">{{ account.name }}</h2>
      <RouterLink to="/home/EditAccount" class="joint-card__edit-btn">
        Editar
      </RouterLink>
    </div>

    <div class="joint-card__members">
      <div
        v-for="member in members"
        :key="member.user_id"
        class="joint-member"
      >
        <!-- Avatar -->
        <img
          :src="getMemberAvatar(member)"
          :alt="member.name"
          class="joint-member__avatar"
        />

        <!-- Bloque derecho: importe + barra (alineados con el avatar) -->
        <div class="joint-member__right">
          <div class="joint-member__top">
            <span class="joint-member__amount">{{ getExpense(member.user_id) }} €</span>
            <span class="joint-member__pct">{{ getPercentage(member.user_id) }}%</span>
          </div>
          <div class="joint-member__bar">
            <div
              class="joint-member__bar-fill"
              :style="{ width: getPercentage(member.user_id) + '%' }"
            />
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style lang="scss">
.joint-card {
  background-image: linear-gradient(rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.4)),
    url(../../images/fondo.png);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 20px;
  padding: 24px;
  margin: 16px;
  color: white;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
  }

  &__title {
    font-size: 22px;
    font-weight: 600;
    margin: 0;
    line-height: 1.15;
    letter-spacing: -0.3px;
  }

  &__edit-btn {
    background-color: rgba(255, 255, 255, 0.25);
    border: none;
    border-radius: 8px;
    color: white;
    padding: 6px 14px;
    font-size: 13px;
    cursor: pointer;
    font-weight: 500;
    text-decoration: none;
    transition: background-color 0.2s ease;
    flex-shrink: 0;

    &:hover {
      background-color: rgba(255, 255, 255, 0.35);
    }

    &:active {
      background-color: rgba(255, 255, 255, 0.2);
    }
  }

  &__members {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
}

.joint-member {
  // Avatar a la izquierda, bloque derecho ocupa el resto
  display: flex;
  align-items: center;
  gap: 14px;

  &__avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
    border: 2px solid rgba(255, 255, 255, 0.5);
  }

  // El bloque derecho ocupa todo el espacio disponible
  // → la barra arranca justo donde arranca el importe, no donde el avatar
  &__right {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 7px;
    min-width: 0;
  }

  &__top {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }

  &__amount {
    font-size: 17px;
    font-weight: 600;
    color: white;
    letter-spacing: -0.2px;
  }

  &__pct {
    font-size: 13px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
  }

  // Barra que arranca alineada con el texto, igual que en el diseño
  &__bar {
    height: 6px;
    border-radius: 3px;
    overflow: hidden;
    background-color: rgba(255, 255, 255, 0.25); // mismo que stat__bar--expense
  }

  &__bar-fill {
    height: 100%;
    border-radius: 3px;
    background-color: rgba(255, 255, 255, 0.85);
    transition: width 0.3s ease; // mismo timing que CardComponent
  }
}
</style>