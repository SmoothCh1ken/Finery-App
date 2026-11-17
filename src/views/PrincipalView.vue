<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '../components/Sidebar.vue'

const router = useRouter()

// ==========================================
// 1. ESTADO REACTIVO DE LA LISTA DE GASTOS
// ==========================================
const gastos = ref([
  { id: 1, concepto: 'Suscripción de Internet', tipoPago: 'Tarjeta de Crédito', monto: 45 },
  { id: 2, concepto: 'Compra de Alimentos', tipoPago: 'Efectivo', monto: 120 }
])

// ==========================================
// 2. PRESUPUESTO Y CÁLCULOS DINÁMICOS (SIN CENTAVOS)
// ==========================================
const presupuesto = ref(500)

const totalPagado = computed(() => {
  return gastos.value.reduce((total, gasto) => total + Math.round(gasto.monto), 0)
})

const disponible = computed(() => {
  return Math.round(presupuesto.value) - totalPagado.value
})

// ==========================================
// 3. FORMULARIO PARA AGREGAR NUEVO GASTO
// ==========================================
const concepto = ref('')
const tipoPago = ref('Tarjeta de Crédito')
const monto = ref(null)

const agregarGasto = () => {
  if (!concepto.value || monto.value === null || monto.value <= 0) return

  gastos.value.push({
    id: Date.now(),
    concepto: concepto.value,
    tipoPago: tipoPago.value,
    monto: Math.round(Number(monto.value))
  })

  concepto.value = ''
  tipoPago.value = 'Tarjeta de Crédito'
  monto.value = null
}

// ==========================================
// 4. LÓGICA DE EDICIÓN (MODAL EN PANTALLA)
// ==========================================
const gastoEditando = ref(null)
const formEdit = ref({
  concepto: '',
  tipoPago: 'Tarjeta de Crédito',
  monto: 0
})

const iniciarEdicion = (gasto) => {
  gastoEditando.value = gasto.id
  formEdit.value = {
    ...gasto,
    monto: Math.round(gasto.monto)
  }
}

const cancelarEdicion = () => {
  gastoEditando.value = null
}

const guardarEdicion = () => {
  const index = gastos.value.findIndex(g => g.id === gastoEditando.value)
  if (index !== -1) {
    gastos.value[index] = {
      id: gastoEditando.value,
      concepto: formEdit.value.concepto,
      tipoPago: formEdit.value.tipoPago,
      monto: Math.round(Number(formEdit.value.monto))
    }
  }
  cancelarEdicion()
}

// ==========================================
// 5. LÓGICA DE DOBLE CONFIRMACIÓN DE ELIMINACIÓN
// ==========================================
const pasodeEliminacion = ref(0) // 0 = inactivo, 1 = Primera confirmación, 2 = Segunda confirmación
const gastoAEliminar = ref(null)

const iniciarEliminacion = (gasto) => {
  gastoAEliminar.value = gasto
  pasodeEliminacion.value = 1
}

const avanzarSegundaConfirmacion = () => {
  pasodeEliminacion.value = 2
}

const confirmarEliminacionDefinitiva = () => {
  if (gastoAEliminar.value) {
    gastos.value = gastos.value.filter(g => g.id !== gastoAEliminar.value.id)
  }
  cancelarEliminacion()
}

const cancelarEliminacion = () => {
  gastoAEliminar.value = null
  pasodeEliminacion.value = 0
}

// ==========================================
// 6. AHORRO COMPARTIDO (COMPATIBLE CON AhorroView)
// ==========================================
const ahorrosCompartidos = ref([
  {
    id: 1,
    nombre: 'Viaje a Japón',
    valorActual: 1560000,
    metaTotal: 8400000,
    icono: 'bi-airplane-engines',
    colorIcono: '#FF5722',
    participantes: [
      { id: 101, correo: 'carlos.mendez@correo.com', estado: 'Compartiendo' },
      { id: 102, correo: 'laura.gomez@correo.com', estado: 'Compartiendo' },
      { id: 103, correo: 'andres.ruiz@correo.com', estado: 'Pendiente' }
    ]
  }
])

const formatearDinero = (valor) => {
  return Math.round(Number(valor || 0)).toLocaleString('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })
}

const calcularPorcentaje = (ahorro) => {
  if (!ahorro || !ahorro.metaTotal || ahorro.metaTotal <= 0) return 0
  const pct = Number(((ahorro.valorActual / ahorro.metaTotal) * 100).toFixed(2))
  return Math.min(100, Math.max(0, pct))
}

const porcentajeBarra = (ahorro) => {
  return calcularPorcentaje(ahorro)
}

// Navegar a la vista de Ahorro Compartido al hacer clic en la tarjeta
const irAAhorroCompartido = () => {
  const rutas = router.getRoutes()
  const rutaAhorro = rutas.find(
    r =>
      r.path.toLowerCase().includes('ahorro') ||
      (r.name && String(r.name).toLowerCase().includes('ahorro'))
  )
  if (rutaAhorro) {
    router.push(rutaAhorro.path)
  } else {
    router.push('/ahorro')
  }
}

// Modal: Agregar Monto (+ Agregar Monto) idéntico a AhorroView
const mostrarModalAbonar = ref(false)
const ahorroSeleccionadoAbono = ref(null)
const montoAbono = ref(null)
const errorAbono = ref('')

const abrirModalAbonar = (ahorro) => {
  ahorroSeleccionadoAbono.value = ahorro
  montoAbono.value = null
  errorAbono.value = ''
  mostrarModalAbonar.value = true
}

const confirmarAbono = () => {
  if (!montoAbono.value || montoAbono.value <= 0) {
    errorAbono.value = 'Ingresa un monto válido mayor a $0.'
    return
  }

  if (ahorroSeleccionadoAbono.value) {
    ahorroSeleccionadoAbono.value.valorActual =
      Math.round(Number(ahorroSeleccionadoAbono.value.valorActual)) +
      Math.round(Number(montoAbono.value))
  }

  mostrarModalAbonar.value = false
  ahorroSeleccionadoAbono.value = null
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
        <form class="row g-3 align-items-end mb-4 p-3 rounded-4 border border-secondary border-opacity-25" style="background-color: #1a1a1a;" @submit.prevent="agregarGasto">
          <div class="col-md-4">
            <label class="form-label text-white-50 small">¿Qué has pagado?</label>
            <input v-model="concepto" type="text" class="form-control bg-dark text-white border-secondary" placeholder="Ej: Supermercado" required>
          </div>

          <div class="col-md-3">
            <label class="form-label text-white-50 small">Tipo de pago</label>
            <select v-model="tipoPago" class="form-select bg-dark text-white border-secondary">
              <option>Tarjeta de Crédito</option>
              <option>Tarjeta de Débito</option>
              <option>Efectivo</option>
              <option>Transferencia</option>
            </select>
          </div>

          <div class="col-md-2">
            <label class="form-label text-white-50 small">Monto</label>
            <input v-model.number="monto" type="number" class="form-control bg-dark text-white border-secondary" placeholder="$0" step="1" min="1" required>
          </div>

          <div class="col-md-3">
            <button type="submit" class="btn text-white w-100 fw-bold rounded-3" style="background-color: #FF5722;">
              + Agregar Monto
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
                  <td class="p-3 fw-bold">${{ Math.round(gasto.monto) }}</td>
                  <td class="p-3 text-end">
                    <button @click="iniciarEdicion(gasto)" class="btn btn-sm btn-outline-light me-1" title="Editar">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button @click="iniciarEliminacion(gasto)" class="btn btn-sm btn-outline-danger" title="Eliminar">
                      <i class="bi bi-trash"></i>
                    </button>
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
        <div class="row g-3 mb-5">
          <div class="col-md-4">
            <div class="p-3 rounded-4 border border-secondary border-opacity-25 text-center" style="background-color: #1a1a1a;">
              <p class="text-white-50 small mb-1">Total Pagado</p>
              <h4 class="fw-bold mb-0">${{ Math.round(totalPagado) }}</h4>
            </div>
          </div>

          <div class="col-md-4">
            <div class="p-3 rounded-4 border border-secondary border-opacity-25 text-center" style="background-color: #1a1a1a;">
              <p class="text-white-50 small mb-1">Presupuesto</p>
              <h4 class="fw-bold mb-0">${{ Math.round(presupuesto) }}</h4>
            </div>
          </div>

          <div class="col-md-4">
            <div class="p-3 rounded-4 border border-secondary border-opacity-25 text-center" style="background-color: #1a1a1a;">
              <p class="text-white-50 small mb-1">Disponible</p>
              <h4 class="fw-bold mb-0" :style="{ color: disponible < 0 ? '#dc3545' : '#FF5722' }">
                ${{ Math.round(disponible) }}
              </h4>
            </div>
          </div>
        </div>

        <!-- SECCIÓN DE AHORRO COMPARTIDO (IDÉNTICA A AhorroView) -->
        <div 
          v-for="ahorro in ahorrosCompartidos" 
          :key="ahorro.id"
          @click="irAAhorroCompartido"
          class="row g-3 mb-4 p-4 rounded-4 border border-secondary border-opacity-25 card-interactiva align-items-center position-relative" 
          style="background-color: #1a1a1a;"
          title="Haz clic para ir a tus ahorros compartidos"
        >
          <!-- NOMBRE E ICONO DEL AHORRO -->
          <div class="col-md-4">
            <div class="d-flex flex-wrap align-items-center gap-2 mb-1">
              <span class="text-white-50 small">
                Ahorro Compartido
                <i class="bi bi-people-fill ms-1"></i>
              </span>
              <span class="badge bg-dark border border-secondary">
                {{ ahorro.participantes.length + 1 }} miembros
              </span>
              <!-- SELLO DE COMPLETADO AL LLEGAR AL 100% -->
              <span 
                v-if="calcularPorcentaje(ahorro) >= 100" 
                class="badge bg-success text-white text-uppercase fw-bold px-2 py-1 d-inline-flex align-items-center gap-1 sello-completado"
              >
                <i class="bi bi-patch-check-fill"></i> Completado
              </span>
            </div>

            <h3 class="fw-bold mb-0 d-flex align-items-center gap-2">
              <i :class="['bi', ahorro.icono]" :style="{ color: ahorro.colorIcono }"></i>
              <span>{{ ahorro.nombre }}</span>
            </h3>
          </div>

          <!-- BARRA DE PROGRESO Y MONTOS -->
          <div class="col-md-6">
            <div class="d-flex justify-content-between align-items-baseline">
              <p class="text-white fw-bold mb-0 fs-5">
                ${{ formatearDinero(ahorro.valorActual) }} <span class="text-white-50 fw-normal fs-6">Ahorrados</span>
              </p>
              <span v-if="calcularPorcentaje(ahorro) < 100" class="small text-white-50">
                ¡Solo faltan ${{ formatearDinero(Math.max(0, ahorro.metaTotal - ahorro.valorActual)) }}!
              </span>
              <span v-else class="small fw-bold text-white">
                ¡Meta alcanzada!
              </span>
            </div>

            <div class="progress mt-2 mb-2 bg-dark" style="height: 22px;" role="progressbar" :aria-valuenow="porcentajeBarra(ahorro)" aria-valuemin="0" aria-valuemax="100">
              <div 
                class="progress-bar fw-bold" 
                :style="{ 
                  width: porcentajeBarra(ahorro) + '%', 
                  backgroundColor: ahorro.colorIcono,
                  color: ahorro.colorIcono === '#ffffff' || ahorro.colorIcono === '#ffc107' || ahorro.colorIcono === '#0dcaf0' ? '#000' : '#fff'
                }"
              >
                {{ calcularPorcentaje(ahorro).toString().replace('.', ',') }}%
              </div>
            </div>

            <p class="text-white-50 mb-0 small">
              Objetivo: <strong class="text-white">${{ formatearDinero(ahorro.metaTotal) }}</strong>
            </p>
          </div>

          <!-- BOTÓN AGREGAR MONTO (DETIENE PROPAGACIÓN DEL CLIC DE LA TARJETA) -->
          <div class="col-md-2">
            <button 
              @click.stop="abrirModalAbonar(ahorro)" 
              type="button" 
              class="btn btn-outline-light w-100 py-3 fw-bold rounded-3"
            >
              + Agregar Monto
            </button>
          </div>
        </div>

      </div>

    </div>
  </div>

  <!-- MODAL 1: EDICIÓN DE MOVIMIENTO -->
  <div v-if="gastoEditando !== null" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.8); z-index: 1050;">
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
              <input v-model.number="formEdit.monto" type="number" step="1" min="1" class="form-control bg-dark text-white border-secondary" required>
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

  <!-- MODAL 2: DOBLE CONFIRMACIÓN DE ELIMINACIÓN -->
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
            <p class="fw-bold mb-2">{{ gastoAEliminar?.concepto }}</p>
            <div class="d-flex justify-content-between">
              <div>
                <span class="text-white-50 small">Monto: </span>
                <span class="fw-bold text-danger">${{ Math.round(gastoAEliminar?.monto || 0) }}</span>
              </div>
              <div>
                <span class="text-white-50 small">Tipo de Pago: </span>
                <span class="fw-bold">{{ gastoAEliminar?.tipoPago }}</span>
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

  <!-- MODAL 3: AGREGAR MONTO AL AHORRO COMPARTIDO (IDÉNTICO A AhorroView) -->
  <div v-if="mostrarModalAbonar" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.85); z-index: 1050;">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content bg-dark text-white border border-secondary rounded-4">
        <div class="modal-header border-secondary">
          <h5 class="modal-title fw-bold d-flex align-items-center gap-2">
            <i :class="['bi', ahorroSeleccionadoAbono?.icono]" :style="{ color: ahorroSeleccionadoAbono?.colorIcono }"></i>
            Aportar a {{ ahorroSeleccionadoAbono?.nombre }}
          </h5>
          <button type="button" class="btn-close btn-close-white" @click="mostrarModalAbonar = false"></button>
        </div>

        <div class="modal-body">
          <div v-if="errorAbono" class="alert alert-danger py-2 small mb-3">
            {{ errorAbono }}
          </div>

          <div class="p-3 mb-3 rounded-3 border border-secondary border-opacity-25 d-flex justify-content-between" style="background-color: #1a1a1a;">
            <div>
              <span class="text-white-50 small d-block">Ahorro actual:</span>
              <span class="fw-bold fs-5">${{ formatearDinero(ahorroSeleccionadoAbono?.valorActual) }}</span>
            </div>
            <div class="text-end">
              <span class="text-white-50 small d-block">Meta total:</span>
              <span class="fw-bold fs-5 text-white-50">${{ formatearDinero(ahorroSeleccionadoAbono?.metaTotal) }}</span>
            </div>
          </div>

          <form @submit.prevent="confirmarAbono">
            <div class="mb-3">
              <label class="form-label text-white-50 small">Monto a Agregar ($)</label>
              <div class="input-group input-group-lg">
                <span class="input-group-text bg-dark text-white border-secondary">$</span>
                <input 
                  v-model.number="montoAbono" 
                  type="number" 
                  min="1" 
                  step="1" 
                  class="form-control bg-dark text-white border-secondary fw-bold" 
                  placeholder="0"
                  autofocus
                  required
                >
              </div>
            </div>

            <div class="d-flex justify-content-end gap-2 mt-4">
              <button type="button" class="btn btn-outline-secondary rounded-3" @click="mostrarModalAbonar = false">Cancelar</button>
              <button type="submit" class="btn text-white fw-bold rounded-3 px-4" style="background-color: #FF5722;">
                + Agregar al Ahorro
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-interactiva {
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.card-interactiva:hover {
  transform: translateY(-3px);
  border-color: #FF5722 !important;
}

.sello-completado {
  border: 1px solid rgba(255, 255, 255, 0.35);
  letter-spacing: 0.5px;
  box-shadow: 0 0 10px rgba(25, 135, 84, 0.45);
}
</style>