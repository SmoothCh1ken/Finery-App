<script setup>
import { ref, computed } from 'vue'
import Sidebar from '../components/Sidebar.vue'

// 1. ESTADO REACTIVO CON LOS MOVIMIENTOS INICIALES
const movimientos = ref([
  { id: 1, concepto: 'Suscripción de Internet', tipoPago: 'Tarjeta de Crédito', monto: 45.00, fecha: '14 Sep, 2026' },
  { id: 2, concepto: 'Compra de Alimentos', tipoPago: 'Efectivo', monto: 120.00, fecha: '13 Sep, 2026' },
  { id: 3, concepto: 'Gasolina', tipoPago: 'Tarjeta de Débito', monto: 40.00, fecha: '12 Sep, 2026' },
  { id: 4, concepto: 'Cena Restaurante', tipoPago: 'Tarjeta de Crédito', monto: 65.50, fecha: '11 Sep, 2026' },
  { id: 5, concepto: 'Suscripción Netflix', tipoPago: 'Tarjeta de Crédito', monto: 15.99, fecha: '10 Sep, 2026' },
  { id: 6, concepto: 'Servicio de Energía', tipoPago: 'Transferencia', monto: 55.20, fecha: '09 Sep, 2026' },
  { id: 7, concepto: 'Transporte (Uber)', tipoPago: 'Tarjeta de Crédito', monto: 12.50, fecha: '08 Sep, 2026' },
  { id: 8, concepto: 'Farmacia', tipoPago: 'Efectivo', monto: 22.40, fecha: '07 Sep, 2026' },
  { id: 9, concepto: 'Café y Snacks', tipoPago: 'Efectivo', monto: 4.50, fecha: '06 Sep, 2026' },
  { id: 10, concepto: 'Gimnasio', tipoPago: 'Tarjeta de Débito', monto: 30.00, fecha: '05 Sep, 2026' },
  { id: 11, concepto: 'Ropa', tipoPago: 'Tarjeta de Crédito', monto: 89.90, fecha: '03 Sep, 2026' },
  { id: 12, concepto: 'Servicio de Agua', tipoPago: 'Transferencia', monto: 18.20, fecha: '02 Sep, 2026' },
  { id: 13, concepto: 'Suscripción Spotify', tipoPago: 'Tarjeta de Crédito', monto: 5.99, fecha: '01 Sep, 2026' },
  { id: 14, concepto: 'Cine', tipoPago: 'Efectivo', monto: 25.00, fecha: '01 Sep, 2026' }
])

// 2. PRESUPUESTO Y CÁLCULOS DINÁMICOS
const presupuesto = ref(500.00)

const totalPagado = computed(() => {
  return movimientos.value.reduce((total, m) => total + m.monto, 0)
})

const disponible = computed(() => {
  return presupuesto.value - totalPagado.value
})

// 3. LÓGICA DE EDICIÓN (MODAL EN PANTALLA)
const movimientoEditando = ref(null)
const formEdit = ref({
  concepto: '',
  tipoPago: 'Tarjeta de Crédito',
  monto: 0,
  fecha: ''
})

const iniciarEdicion = (mov) => {
  movimientoEditando.value = mov.id
  formEdit.value = { ...mov }
}

const cancelarEdicion = () => {
  movimientoEditando.value = null
}

const guardarEdicion = () => {
  const index = movimientos.value.findIndex(m => m.id === movimientoEditando.value)
  if (index !== -1) {
    movimientos.value[index] = {
      id: movimientoEditando.value,
      concepto: formEdit.value.concepto,
      tipoPago: formEdit.value.tipoPago,
      monto: Number(formEdit.value.monto),
      fecha: formEdit.value.fecha
    }
  }
  cancelarEdicion()
}

// 4. LÓGICA DE DOBLE CONFIRMACIÓN DE ELIMINACIÓN
// pasodeEliminacion: 0 = inactivo, 1 = Primera confirmación, 2 = Segunda confirmación
const pasodeEliminacion = ref(0)
const movimientoAEliminar = ref(null)

const iniciarEliminacion = (mov) => {
  movimientoAEliminar.value = mov
  pasodeEliminacion.value = 1
}

const avanzarSegundaConfirmacion = () => {
  pasodeEliminacion.value = 2
}

const confirmarEliminacionDefinitiva = () => {
  if (movimientoAEliminar.value) {
    movimientos.value = movimientos.value.filter(m => m.id !== movimientoAEliminar.value.id)
  }
  cancelarEliminacion()
}

const cancelarEliminacion = () => {
  movimientoAEliminar.value = null
  pasodeEliminacion.value = 0
}
</script>

<template>
  <div class="container-fluid p-0">
    <div class="row g-0 min-vh-100">

      <!-- MENÚ LATERAL REUTILIZABLE -->
      <Sidebar />

      <!-- CONTENIDO PRINCIPAL -->
      <div class="col-md-9 col-lg-10 p-4 p-md-5 text-white" style="background-color: #121212;">
        
        <div class="mb-4">
          <h2 class="fw-bold">Administra tus movimientos.</h2>
          <p class="text-white-50">Revisa y gestiona todos tus movimientos financieros de manera sencilla.</p>
        </div>

        <hr class="mb-4">
        <div class="mb-4">
          <h3 class="fw-bold">Historial de Movimientos</h3>
        </div>

        <!-- TABLA DE HISTORIAL DE MOVIMIENTOS -->
        <div class="card bg-dark text-white border-secondary border-opacity-25 rounded-4 overflow-hidden mb-4">
          <div class="table-responsive">
            <table class="table table-dark table-hover mb-0 align-middle">
              <thead class="table-active">
                <tr>
                  <th class="p-3">Concepto</th>
                  <th class="p-3">Tipo de Pago</th>
                  <th class="p-3">Monto</th>
                  <th class="p-3">Fecha</th>
                  <th class="p-3 text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="movimiento in movimientos" :key="movimiento.id">
                  <td class="p-3">{{ movimiento.concepto }}</td>
                  <td class="p-3"><span class="badge bg-secondary">{{ movimiento.tipoPago }}</span></td>
                  <td class="p-3 fw-bold">${{ movimiento.monto.toFixed(2) }}</td>
                  <td class="p-3 text-white-50">{{ movimiento.fecha }}</td>
                  <td class="p-3 text-end">
                    <button @click="iniciarEdicion(movimiento)" class="btn btn-sm btn-outline-light me-1" title="Editar">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button @click="iniciarEliminacion(movimiento)" class="btn btn-sm btn-outline-danger" title="Eliminar">
                      <i class="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
                <tr v-if="movimientos.length === 0">
                  <td colspan="5" class="p-4 text-center text-white-50">
                    No hay movimientos registrados en tu historial.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- TARJETAS DE RESUMEN DE TOTALES CALCULADAS DINÁMICAMENTE -->
        <div class="row g-3 mb-4">
          <div class="col-md-4">
            <div class="p-3 rounded-4 border border-secondary border-opacity-25 text-center" style="background-color: #1a1a1a;">
              <p class="text-white-50 small mb-1">Total Pagado (Últimos 30 días)</p>
              <h4 class="fw-bold mb-0">${{ totalPagado.toFixed(2) }}</h4>
            </div>
          </div>

          <div class="col-md-4">
            <div class="p-3 rounded-4 border border-secondary border-opacity-25 text-center" style="background-color: #1a1a1a;">
              <p class="text-white-50 small mb-1">Presupuesto</p>
              <h4 class="fw-bold mb-0">${{ presupuesto.toFixed(2) }}</h4>
            </div>
          </div>

          <div class="col-md-4">
            <div class="p-3 rounded-4 border border-secondary border-opacity-25 text-center" style="background-color: #1a1a1a;">
              <p class="text-white-50 small mb-1">Disponible</p>
              <h4 class="fw-bold mb-0" :style="{ color: disponible < 0 ? '#dc3545' : '#FF5722' }">
                ${{ disponible.toFixed(2) }}
              </h4>
            </div>
          </div>
        </div>

      </div>

    </div>
  </div>

  <!-- MODAL DE EDICIÓN DE MOVIMIENTO -->
  <div v-if="movimientoEditando !== null" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.8); z-index: 1050;">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content bg-dark text-white border border-secondary rounded-4">
        <div class="modal-header border-secondary">
          <h5 class="modal-title fw-bold">Editar Movimiento</h5>
          <button type="button" class="btn-close btn-close-white" @click="cancelarEdicion"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="guardarEdicion">
            <div class="mb-3">
              <label class="form-label text-white-50 small">Concepto</label>
              <input v-model="formEdit.concepto" type="text" class="form-control bg-dark text-white border-secondary" required>
            </div>
            <div class="mb-3">
              <label class="form-label text-white-50 small">Tipo de Pago</label>
              <select v-model="formEdit.tipoPago" class="form-select bg-dark text-white border-secondary">
                <option>Tarjeta de Crédito</option>
                <option>Tarjeta de Débito</option>
                <option>Efectivo</option>
                <option>Transferencia</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label text-white-50 small">Monto ($)</label>
              <input v-model.number="formEdit.monto" type="number" step="0.01" min="0.01" class="form-control bg-dark text-white border-secondary" required>
            </div>
            <div class="mb-3">
              <label class="form-label text-white-50 small">Fecha</label>
              <input v-model="formEdit.fecha" type="text" class="form-control bg-dark text-white border-secondary" required>
            </div>
            <div class="d-flex justify-content-end gap-2 mt-4">
              <button type="button" class="btn btn-outline-secondary rounded-3" @click="cancelarEdicion">Cancelar</button>
              <button type="submit" class="btn text-white fw-bold rounded-3" style="background-color: #FF5722;">Guardar Cambios</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>

  <!-- MODAL DE DOBLE CONFIRMACIÓN DE ELIMINACIÓN -->
  <div v-if="pasodeEliminacion > 0" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.85); z-index: 1055;">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content bg-dark text-white border border-danger rounded-4">
        
        <div class="modal-header border-secondary">
          <h5 class="modal-title fw-bold text-danger d-flex align-items-center gap-2">
            <i class="bi bi-exclamation-triangle-fill"></i>
            Confirmación de Eliminación (Paso {{ pasodeEliminacion }} de 2)
          </h5>
          <button type="button" class="btn-close btn-close-white" @click="cancelarEliminacion"></button>
        </div>

        <!-- PASO 1 DE CONFIRMACIÓN -->
        <div v-if="pasodeEliminacion === 1" class="modal-body text-center py-4">
          <p class="fs-5 mb-3">¿Estás seguro de que deseas eliminar este movimiento?</p>
          <div class="p-3 mb-4 rounded-3 border border-secondary text-start" style="background-color: #1a1a1a;">
            <p class="mb-1 text-white-50 small">Concepto:</p>
            <p class="fw-bold mb-2">{{ movimientoAEliminar?.concepto }}</p>
            <div class="d-flex justify-content-between">
              <div>
                <span class="text-white-50 small">Monto: </span>
                <span class="fw-bold text-danger">${{ movimientoAEliminar?.monto.toFixed(2) }}</span>
              </div>
              <div>
                <span class="text-white-50 small">Fecha: </span>
                <span class="fw-bold">{{ movimientoAEliminar?.fecha }}</span>
              </div>
            </div>
          </div>
          <div class="d-flex justify-content-center gap-3">
            <button @click="cancelarEliminacion" class="btn btn-outline-light rounded-3 px-4">Cancelar</button>
            <button @click="avanzarSegundaConfirmacion" class="btn btn-warning fw-bold rounded-3 px-4">
              Continuar a Confirmación Final
            </button>
          </div>
        </div>

        <!-- PASO 2 DE CONFIRMACIÓN (DEFINITIVA) -->
        <div v-if="pasodeEliminacion === 2" class="modal-body text-center py-4">
          <i class="bi bi-shield-slash-fill text-danger display-3 mb-3 d-block"></i>
          <h4 class="fw-bold text-danger mb-2">¡Advertencia Irreversible!</h4>
          <p class="text-white-50 mb-4">Esta acción eliminará de forma permanente el registro seleccionado de tu base de datos. ¿Deseas proceder?</p>
          <div class="d-flex justify-content-center gap-3">
            <button @click="cancelarEliminacion" class="btn btn-outline-light rounded-3 px-4">No, Cancelar</button>
            <button @click="confirmarEliminacionDefinitiva" class="btn btn-danger fw-bold rounded-3 px-4">
              <i class="bi bi-trash me-1"></i> Sí, Eliminar Definitivamente
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>