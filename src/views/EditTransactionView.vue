<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTransactionStore } from '@/stores/TransactionStore'
import { useToast } from '@/composables/useToast'
import IconArrow from '@/components/icons/IconArrow.vue'
import TransactionBodyComponent from '@/components/TransactionBodyComponent.vue'
import ConfirmationModal from '@/components/ConfirmationModal.vue'
import AsideNav from '@/components/Navs/AsideNav.vue'
import BottomNav from '@/components/Navs/BottomNav.vue'

const router = useRouter()
const route = useRoute()
const transactionStore = useTransactionStore()
const { showToast } = useToast()

const transactionId = Number(route.params.id)
const showDeleteModal = ref(false)
const isDeleting = ref(false)

const goBack = () => {
  router.push('/home')
}

const handleDelete = async () => {
  isDeleting.value = true
  try {
    const success = await transactionStore.deleteTransaction(transactionId)
    if (success) {
      showToast('Transacción eliminada con éxito', 'success')
      router.push('/home')
    } else {
      showToast('No se pudo eliminar la transacción', 'error')
    }
  } catch (error) {
    showToast('Error al intentar eliminar', 'error')
  } finally {
    isDeleting.value = false
    showDeleteModal.value = false
  }
}
</script>

<template>
  <div class="app-shell">
    <!-- Header Especial -->
    <header class="top-nav">
      <button class="back-btn" @click="goBack" aria-label="Volver">
        <IconArrow class="icon-back" />
      </button>

      <h1 class="title">Editar Transacción</h1>

      <button class="delete-btn" @click="showDeleteModal = true" aria-label="Eliminar transacción">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="icon-trash">
          <path
            d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </header>

    <div class="layout-container">
      <AsideNav />

      <!-- Componente Formulario (modo Edición) -->
      <main class="main-content">
        <!-- Botón flotante de eliminar para PC (ya que quitamos el header) -->
        <button
          v-if="transactionId"
          class="desktop-delete-float pc-only"
          @click="showDeleteModal = true"
          title="Eliminar transacción"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>

        <TransactionBodyComponent :transactionId="transactionId">
          <template #desktop-header>
            <!-- Header removido por petición del usuario para diseño minimalista -->
          </template>
        </TransactionBodyComponent>
      </main>
    </div>

    <!-- Confirmación de Eliminación -->
    <ConfirmationModal
      v-if="showDeleteModal"
      title="Eliminar Transacción"
      message="¿Estás seguro de que deseas eliminar esta transacción? Esta acción no se puede deshacer."
      confirmText="Eliminar"
      @confirm="handleDelete"
      @cancel="showDeleteModal = false"
    />
    <BottomNav class="mobile-only" />
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/base/variables.scss';

.app-shell {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  width: 100%;
  overflow: hidden;
  background-color: $background-principal;
}

.top-nav {
  position: sticky; // Sticky for flow
  top: 0;
  width: 100%;
  height: calc(85px + env(safe-area-inset-top));
  flex-shrink: 0;
  z-index: 1000;
  box-sizing: border-box;
  background-color: #e5e5e5;
  padding: calc(16px + env(safe-area-inset-top)) 20px 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);

  @media (min-width: 768px) {
    display: none;
  }

  .title {
    font-size: 1.25rem;
    font-weight: 600;
    color: $color-text;
    flex: 1;
    text-align: center;
    margin: 0;
  }
}

.layout-container {
  display: flex;
  flex: 1;
  width: 100%;
  overflow: hidden;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  position: relative;
  -webkit-overflow-scrolling: touch;
  background-color: #ffffff;

  @media (min-width: 768px) {
    background-color: $background-principal;
  }
}

.back-btn,
.delete-btn {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $color-text;
  border-radius: 50%;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
}

.icon-back {
  width: 24px;
  height: 24px;
  transform: rotate(90deg);
}

.icon-trash {
  color: $color-danger;
  width: 24px;
  height: 24px;
}

.desktop-delete-float {
  display: none;

  @media (min-width: 768px) {
    display: flex;
    position: fixed;
    top: 30px;
    right: 530px;
    background: rgba(255, 59, 48, 0.1);
    color: $color-danger;
    border: none;
    padding: 10px;
    border-radius: 50%;
    cursor: pointer;
    z-index: 1001;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(255, 59, 48, 0.2);
      transform: scale(1.1);
    }
  }
}

.pc-only {
  @media (max-width: 767px) {
    display: none !important;
  }
}

.mobile-only {
  @media (min-width: 768px) {
    display: none;
  }
}
</style>
