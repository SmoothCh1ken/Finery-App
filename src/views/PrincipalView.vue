<script setup>
import { ref, computed } from 'vue'
import Sidebar from '../components/Sidebar.vue'

// Estado reactivo de la lista de gastos
const gastos = ref([
  { id: 1, concepto: 'Suscripción de Internet', tipoPago: 'Tarjeta de Crédito', monto: 45.00 },
  { id: 2, concepto: 'Compra de Alimentos', tipoPago: 'Efectivo', monto: 120.00 }
])

// Variables reactivas para el formulario
const concepto = ref('')
const tipoPago = ref('Tarjeta de Crédito')
const monto = ref(null)

// Estado de edición y presupuesto base
const idEditando = ref(null)
const presupuesto = ref(500.00)

// PASO 6: Propiedades computadas para cálculos automáticos en tiempo real
const totalPagado = computed(() => {
  return gastos.value.reduce((total, gasto) => total + gasto.monto, 0)
})

const disponible = computed(() => {
  return presupuesto.value - totalPagado.value
})

// Función para guardar (Crear o Actualizar) un gasto
const guardarGasto = () => {
  if (!concepto.value || monto.value === null || monto.value <= 0) return

  if (idEditando.value !== null) {
    // MODO EDICIÓN: actualizar el gasto coincidente
    const index = gastos.value.findIndex(gasto => gasto.id === idEditando.value)
    if (index !== -1) {
      gastos.value[index] = {
        id: idEditando.value,
        concepto: concepto.value,
        tipoPago: tipoPago.value,
        monto: Number(monto.value)
      }
    }
    idEditando.value = null
  } else {
    // MODO CREACIÓN: agregar nuevo gasto
    gastos.value.push({
      id: Date.now(),
      concepto: concepto.value,
      tipoPago: tipoPago.value,
      monto: Number(monto.value)
    })
  }

  limpiarFormulario()
}

// Cargar datos de un gasto en el formulario para editar
const cargarEdicion = (gasto) => {
  idEditando.value = gasto.id
  concepto.value = gasto.concepto
  tipoPago.value = gasto.tipoPago
  monto.value = gasto.monto
}

// Cancelar edición activa
const cancelarEdicion = () => {
  idEditando.value = null
  limpiarFormulario()
}

// Limpiar inputs del formulario
const limpiarFormulario = () => {
  concepto.value = ''
  tipoPago.value = 'Tarjeta de Crédito'
  monto.value = null
}

// Función para eliminar un gasto según su ID
const eliminarGasto = (id) => {
  if (idEditando.value === id) {
    cancelarEdicion()
  }
  gastos.value = gastos.value.filter(gasto => gasto.id !== id)
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
          <h2 class="fw-bold">Bienvenido de nuevo, usuario.</h2>
          <p class="text-white-50">Registra y administra tus gastos diarios fácilmente.</p>
        </div>

        <!-- FORMULARIO DE GASTO REACTIVO -->
        <form class="row g-3 align-items-end mb-4 p-3 rounded-4 border border-secondary border-opacity-25" style="background-color: #1a1a1a;" @submit.prevent="guardarGasto">
          <div class="col-md-4">
            <label class="form-label text-white-50 small">¿Qué has pagado?</label>
            <input v-model="concepto" type="text" class="form-control bg-dark text-white border-secondary" placeholder="Ej: Supermercado" required>
          </div>

          <div class="col-md-3">
            <label class="form-label text-white-50 small">Tipo de pago</label>
            <select v-model="tipoPago" class="form-select bg-dark text-white border-secondary">
              <option>Tarjeta de Crédito</option>
              <option>Efectivo</option>
              <option>Transferencia</option>
            </select>
          </div>

          <div class="col-md-2">
            <label class="form-label text-white-50 small">Monto</label>
            <input v-model.number="monto" type="number" class="form-control bg-dark text-white border-secondary" placeholder="$0.00" step="0.01" min="0.01" required>
          </div>

          <div class="col-md-3 d-flex gap-2">
            <button type="submit" class="btn text-white w-100 fw-bold rounded-3" style="background-color: #FF5722;">
              {{ idEditando ? 'Guardar Cambios' : '+ Agregar Monto' }}
            </button>
            <button v-if="idEditando" type="button" @click="cancelarEdicion" class="btn btn-outline-secondary fw-bold rounded-3">
              Cancelar
            </button>
          </div>
        </form>

        <!-- TABLA DE RESUMEN DE GASTOS DINÁMICA -->
        <div class="card bg-dark text-white border-secondary border-opacity-25 rounded-4 overflow-hidden mb-4">
          <div class="table-responsive">
            <table class="table table-dark table-hover mb-0 align-middle">
              <thead class="table-active">
                <tr>
                  <th class="p-3">Concepto</th>
                  <th class="p-3">Tipo de Pago</th>
                  <th class="p-3">Monto</th>
                  <th class="p-3 text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="gasto in gastos" :key="gasto.id">
                  <td class="p-3">{{ gasto.concepto }}</td>
                  <td class="p-3"><span class="badge bg-secondary">{{ gasto.tipoPago }}</span></td>
                  <td class="p-3 fw-bold">${{ gasto.monto.toFixed(2) }}</td>
                  <td class="p-3 text-end">
                    <button @click="cargarEdicion(gasto)" class="btn btn-sm btn-outline-light me-1"><i class="bi bi-pencil"></i></button>
                    <button @click="eliminarGasto(gasto.id)" class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button>
                  </td>
                </tr>
                <tr v-if="gastos.length === 0">
                  <td colspan="4" class="p-4 text-center text-white-50">
                    No hay gastos registrados. ¡Agrega uno nuevo desde el formulario!
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- TARJETAS DE TOTALES CALCULADAS DINÁMICAMENTE -->
        <div class="row g-3 mb-4">
          <div class="col-md-4">
            <div class="p-3 rounded-4 border border-secondary border-opacity-25 text-center" style="background-color: #1a1a1a;">
              <p class="text-white-50 small mb-1">Total Pagado</p>
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


        <!-- SECCIÓN DE AHORRO COMPARTIDO RESUMIDO -->
        <div class="row g-3 mt-5 mb-4 p-3 rounded-4 border border-secondary border-opacity-25" style="background-color: #1a1a1a;">
          <div class="col-md-4">
            <p class="text-white-50 mb-1">Ahorro Compartido <i class="bi bi-people-fill"></i></p>
            <h2><i class="bi bi-airplane-engines" style="color: #FF5722;"></i> Viaje a Japón</h2>
          </div>
          <div class="col-md-6">
            <p class="text-white mb-0">$1.560.000 Ahorrados</p>
            <div class="progress mt-3 me-3" role="progressbar" aria-label="Success example" aria-valuenow="18.57" aria-valuemin="0" aria-valuemax="100">
              <div class="progress-bar text-bg-success" style="width: 18.57%; color: #FF5722;">18,57%</div>
            </div>
            <p class="text-white-50 mt-1 mb-0">Objetivo: $8.400.000</p>
          </div>
          <div class="col-md-2">
            <button type="button" class="btn btn-outline-light w-100 h-100 fw-bold rounded-3">
              + Agregar Monto
            </button>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>