import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import TransactionBodyComponent from '@/components/TransactionBodyComponent.vue'
import { useTransactionStore } from '@/stores/TransactionStore'
import { useUserStore } from '@/stores/UserStore'
import { useRouter } from 'vue-router'

// Mock de vue-router
vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}))

const { mockShowToast } = vi.hoisted(() => ({
  mockShowToast: vi.fn(),
}))

// Mock de useToast
vi.mock('@/composables/useToast', () => ({
  useToast: vi.fn(() => ({
    showToast: mockShowToast,
  })),
}))

describe('TransactionBodyComponent.vue', () => {
  let wrapper: any

  beforeEach(() => {
    // Restaurar los mocks antes de cada test
    vi.clearAllMocks()

    wrapper = mount(TransactionBodyComponent, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              user: {
                isAuthenticated: true,
                userId: 1,
                accounts: [{ account_id: 1, name: 'Main Account', isActive: true }],
                activeAccountId: 1,
              },
            },
          }),
        ],
        // Stub para iconos que no queremos renderizar completamente en el test
        stubs: {
          IconArrow: true,
          component: true,
          Teleport: true,
        },
      },
    })
  })

  describe('Initial State', () => {
    it('renders with default expense type and zero amount', () => {
      // Verificar botones de tipo
      const buttons = wrapper.findAll('.type-selector button')
      expect(buttons[0].classes()).toContain('active') // Gasto
      expect(buttons[0].text()).toBe('Gasto')
      expect(buttons[1].classes()).not.toContain('active') // Ingreso

      // Verificar monto inicial
      expect(wrapper.find('.value').text()).toBe('0')
    })
  })

  describe('UI Interactions', () => {
    it('switches between Expense and Income types', async () => {
      const typeButtons = wrapper.findAll('.type-selector button')

      // Click en "Ingreso"
      await typeButtons[1].trigger('click')

      expect(typeButtons[0].classes()).not.toContain('active')
      expect(typeButtons[1].classes()).toContain('active')
      expect(wrapper.find('.currency-label').text()).toBe('Nuevo Ingreso')

      // Click de vuelta en "Gasto"
      await typeButtons[0].trigger('click')

      expect(typeButtons[0].classes()).toContain('active')
      expect(typeButtons[1].classes()).not.toContain('active')
      expect(wrapper.find('.currency-label').text()).toBe('Nuevo Gasto')
    })

    it('toggles concept input visibility', async () => {
      // Al inicio no debería estar el input
      expect(wrapper.find('.concept-input').exists()).toBe(false)

      // Expandir concepto
      await wrapper.find('.concept-toggle').trigger('click')

      // Ahora debería existir
      expect(wrapper.find('.concept-input').exists()).toBe(true)
    })
  })

  describe('Keypad Interactions', () => {
    it('updates amount when keypad buttons are clicked', async () => {
      // Abrir el keypad
      await wrapper.find('.amount-display').trigger('click')

      const buttons = wrapper.findAll('.numeric-grid button')

      // El índice en el DOM corresponde a: 1->index 0, 5->index 4
      const btn1 = buttons[0] // 1
      const btn5 = buttons[4] // 5

      await btn1.trigger('click')
      await btn5.trigger('click')

      // El monto debe ser 15
      expect(wrapper.find('.value').text()).toBe('15')
    })

    it('handles decimal comma correctly', async () => {
      const buttons = wrapper.findAll('.numeric-grid button')
      const btn1 = buttons[0] // 1
      const btnComma = buttons[9] // ,
      const btn5 = buttons[4] // 5

      await btn1.trigger('click')
      await btnComma.trigger('click')
      await btn5.trigger('click')

      expect(wrapper.find('.value').text()).toBe('1,5')

      // Intentar añadir otra coma no debería hacer nada
      await btnComma.trigger('click')
      await btn5.trigger('click')
      expect(wrapper.find('.value').text()).toBe('1,55')
    })

    it('handles backspace correctly', async () => {
      const buttons = wrapper.findAll('.numeric-grid button')
      const btn1 = buttons[0] // 1
      const btn5 = buttons[4] // 5
      const btnBackspace = wrapper.find('.backspace') // la flecha de backspace

      await btn1.trigger('click')
      await btn5.trigger('click')
      expect(wrapper.find('.value').text()).toBe('15')

      await btnBackspace.trigger('click')
      expect(wrapper.find('.value').text()).toBe('1')

      await btnBackspace.trigger('click')
      expect(wrapper.find('.value').text()).toBe('0') // fallback a 0
    })
  })

  describe('Form Submission', () => {
    it('shows error toast if no category is selected', async () => {
      // Monto es 0 y categoría es null por defecto
      const saveBtn = wrapper.find('.save-btn')
      await saveBtn.trigger('click')

      expect(mockShowToast).toHaveBeenCalledWith('Por favor selecciona una categoría', 'error')
    })

    it('shows error toast if amount is <= 0', async () => {
      // Seleccionar categoría
      const categoryBtns = wrapper.findAll('.category-item')
      await categoryBtns[0].trigger('click') // Alimentación (ID 1)

      // Monto sigue en 0
      const saveBtn = wrapper.find('.save-btn')
      await saveBtn.trigger('click')

      expect(mockShowToast).toHaveBeenCalledWith('El monto debe ser mayor a 0', 'error')
    })

    it('submits valid transaction data correctly via store', async () => {
      const transactionStore = useTransactionStore()
      transactionStore.createTransaction = vi.fn().mockResolvedValue(true)

      // 1. Seleccionar Categoría (ej: Alimentación)
      const categoryBtns = wrapper.findAll('.category-item')
      await categoryBtns[0].trigger('click')

      // 2. Ingresar monto: 20,5
      const buttons = wrapper.findAll('.numeric-grid button')
      const btn2 = buttons[1] // 2
      const btn0 = buttons[10] // 0
      const btnComma = buttons[9] // ,
      const btn5 = buttons[4] // 5

      await btn2.trigger('click')
      await btn0.trigger('click')
      await btnComma.trigger('click')
      await btn5.trigger('click')

      // 3. Activar el Toggle de Concepto y escribir un texto
      await wrapper.find('.concept-toggle').trigger('click')
      const conceptInput = wrapper.find('.concept-input')
      await conceptInput.setValue('Supermercado')

      // 4. Guardar
      await wrapper.find('.save-btn').trigger('click')

      // Validar llamada al Store con los datos esperados
      expect(transactionStore.createTransaction).toHaveBeenCalledTimes(1)
      expect(transactionStore.createTransaction).toHaveBeenCalledWith(
        1, // account_id mockeado en el useUserStore initial state
        expect.objectContaining({
          amount: 20.5,
          category: 'Alimentación',
          transaction_type: 'expense',
          concept: 'Supermercado',
          isRecurring: false,
        }),
      )

      // Validar notificación de éxito
      expect(mockShowToast).toHaveBeenCalledWith('Transacción guardada con éxito', 'success')

      // Validar reset de estado
      expect(wrapper.find('.value').text()).toBe('0')
    })
  })
})
