<script setup>
import { ref, computed, watch } from 'vue'
import Sidebar from '../components/Sidebar.vue'

// 1. ESTADO REACTIVO CON LOS MOVIMIENTOS INICIALES (SIN CENTAVOS)
const movimientos = ref([
  { id: 1, concepto: 'Suscripción de Internet', tipoPago: 'Tarjeta de Crédito', monto: 45, fecha: '14 Sep, 2026' },
  { id: 2, concepto: 'Compra de Alimentos', tipoPago: 'Efectivo', monto: 120, fecha: '13 Sep, 2026' },
  { id: 3, concepto: 'Gasolina', tipoPago: 'Tarjeta de Débito', monto: 40, fecha: '12 Sep, 2026' },
  { id: 4, concepto: 'Cena Restaurante', tipoPago: 'Tarjeta de Crédito', monto: 66, fecha: '11 Sep, 2026' },
  { id: 5, concepto: 'Suscripción Netflix', tipoPago: 'Tarjeta de Crédito', monto: 16, fecha: '10 Sep, 2026' },
  { id: 6, concepto: 'Servicio de Energía', tipoPago: 'Transferencia', monto: 55, fecha: '09 Sep, 2026' },
  { id: 7, concepto: 'Transporte (Uber)', tipoPago: 'Tarjeta de Crédito', monto: 13, fecha: '08 Sep, 2026' },
  { id: 8, concepto: 'Farmacia', tipoPago: 'Efectivo', monto: 22, fecha: '07 Sep, 2026' },
  { id: 9, concepto: 'Café y Snacks', tipoPago: 'Efectivo', monto: 5, fecha: '06 Sep, 2026' },
  { id: 10, concepto: 'Gimnasio', tipoPago: 'Tarjeta de Débito', monto: 30, fecha: '05 Sep, 2026' },
  { id: 11, concepto: 'Ropa', tipoPago: 'Tarjeta de Crédito', monto: 90, fecha: '03 Sep, 2026' },
  { id: 12, concepto: 'Servicio de Agua', tipoPago: 'Transferencia', monto: 18, fecha: '02 Sep, 2026' },
  { id: 13, concepto: 'Suscripción Spotify', tipoPago: 'Tarjeta de Crédito', monto: 6, fecha: '01 Sep, 2026' },
  { id: 14, concepto: 'Cine', tipoPago: 'Efectivo', monto: 25, fecha: '01 Sep, 2026' },
  { id: 15, concepto: 'Mantenimiento Vehículo', tipoPago: 'Tarjeta de Crédito', monto: 150, fecha: '18 Ago, 2026' },
  { id: 16, concepto: 'Libros y Cursos', tipoPago: 'Transferencia', monto: 48, fecha: '10 Jul, 2026' },
  { id: 17, concepto: 'Regalos Navideños', tipoPago: 'Tarjeta de Crédito', monto: 210, fecha: '20 Dic, 2025' }
])

// 2. UTILIDADES DE FECHA PARA FILTROS
const mesesNombres = [
  { valor: 0, nombre: 'Enero', abrev: 'ene' },
  { valor: 1, nombre: 'Febrero', abrev: 'feb' },
  { valor: 2, nombre: 'Marzo', abrev: 'mar' },
  { valor: 3, nombre: 'Abril', abrev: 'abr' },
  { valor: 4, nombre: 'Mayo', abrev: 'may' },
  { valor: 5, nombre: 'Junio', abrev: 'jun' },
  { valor: 6, nombre: 'Julio', abrev: 'jul' },
  { valor: 7, nombre: 'Agosto', abrev: 'ago' },
  { valor: 8, nombre: 'Septiembre', abrev: 'sep' },
  { valor: 9, nombre: 'Octubre', abrev: 'oct' },
  { valor: 10, nombre: 'Noviembre', abrev: 'nov' },
  { valor: 11, nombre: 'Diciembre', abrev: 'dic' }
]

const parsearFecha = (fechaStr) => {
  if (!fechaStr) return null
  const match = fechaStr.trim().match(/^(\d{1,2})\s+([A-Za-zÁÉÍÓÚáéíóú]+),?\s+(\d{4})$/)
  if (match) {
    const dia = parseInt(match[1], 10)
    const mesAbrev = match[2].slice(0, 3).toLowerCase()
    const anio = parseInt(match[3], 10)
    const mesObj = mesesNombres.find(m => m.abrev === mesAbrev)
    if (mesObj) {
      return new Date(anio, mesObj.valor, dia)
    }
  }
  const fechaNativa = new Date(fechaStr)
  return isNaN(fechaNativa.getTime()) ? null : fechaNativa
}

// 3. ESTADOS DE FILTROS Y ORDENAMIENTO
const ordenValor = ref('') // '' | 'desc' | 'asc'
const filtroTipoPago = ref('')
const filtroMes = ref('')
const filtroAnio = ref('')
const filtroUltimosMeses = ref('')

const aniosDisponibles = computed(() => {
  const anios = new Set()
  movimientos.value.forEach(m => {
    const fecha = parsearFecha(m.fecha)
    if (fecha) anios.add(fecha.getFullYear())
  })
  return Array.from(anios).sort((a, b) => b - a)
})

const hayFiltrosActivos = computed(() => {
  return (
    ordenValor.value !== '' ||
    filtroTipoPago.value !== '' ||
    filtroMes.value !== '' ||
    filtroAnio.value !== '' ||
    filtroUltimosMeses.value !== ''
  )
})

const limpiarFiltros = () => {
  ordenValor.value = ''
  filtroTipoPago.value = ''
  filtroMes.value = ''
  filtroAnio.value = ''
  filtroUltimosMeses.value = ''
  limiteVisible.value = INCREMENTO_PAGINA
}

// Lista filtrada y ordenada
const movimientosFiltrados = computed(() => {
  const ahora = new Date()

  let resultado = movimientos.value.filter(m => {
    // Filtro por tipo de pago
    if (filtroTipoPago.value && m.tipoPago !== filtroTipoPago.value) {
      return false
    }

    const fechaObj = parsearFecha(m.fecha)

    // Filtro por mes
    if (filtroMes.value !== '') {
      if (!fechaObj || fechaObj.getMonth() !== Number(filtroMes.value)) {
        return false
      }
    }

    // Filtro por año
    if (filtroAnio.value !== '') {
      if (!fechaObj || fechaObj.getFullYear() !== Number(filtroAnio.value)) {
        return false
      }
    }

    // Filtro por últimos X meses
    if (filtroUltimosMeses.value !== '') {
      if (!fechaObj) return false
      const fechaLimite = new Date(ahora.getFullYear(), ahora.getMonth() - Number(filtroUltimosMeses.value), ahora.getDate())
      if (fechaObj < fechaLimite) {
        return false
      }
    }

    return true
  })

  // Ordenar por valor
  if (ordenValor.value === 'desc') {
    resultado = [...resultado].sort((a, b) => b.monto - a.monto)
  } else if (ordenValor.value === 'asc') {
    resultado = [...resultado].sort((a, b) => a.monto - b.monto)
  }

  return resultado
})

// 4. PAGINACIÓN ("CARGAR MÁS")
const INCREMENTO_PAGINA = 8
const limiteVisible = ref(INCREMENTO_PAGINA)

watch([ordenValor, filtroTipoPago, filtroMes, filtroAnio, filtroUltimosMeses], () => {
  limiteVisible.value = INCREMENTO_PAGINA
})

const movimientosVisibles = computed(() => {
  return movimientosFiltrados.value.slice(0, limiteVisible.value)
})

const restantesPorCargar = computed(() => {
  return Math.max(0, movimientosFiltrados.value.length - limiteVisible.value)
})

const cargarMas = () => {
  limiteVisible.value += INCREMENTO_PAGINA
}

// 5. PRESUPUESTO Y CÁLCULOS DINÁMICOS (SIN CENTAVOS)
const presupuesto = ref(500)

const totalPagado = computed(() => {
  return movimientosFiltrados.value.reduce((total, m) => total + Math.round(m.monto), 0)
})

const disponible = computed(() => {
  return Math.round(presupuesto.value) - totalPagado.value
})

// 6. LÓGICA DE EDICIÓN (MODAL EN PANTALLA)
const movimientoEditando = ref(null)
const formEdit = ref({
  concepto: '',
  tipoPago: 'Tarjeta de Crédito',
  monto: 0,
  fecha: ''
})

const iniciarEdicion = (mov) => {
  movimientoEditando.value = mov.id
  formEdit.value = {
    ...mov,
    monto: Math.round(mov.monto)
  }
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
      monto: Math.round(Number(formEdit.value.monto)),
      fecha: formEdit.value.fecha
    }
  }
  cancelarEdicion()
}

// 7. LÓGICA DE DOBLE CONFIRMACIÓN DE ELIMINACIÓN
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

        <div class="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
          <h3 class="fw-bold mb-0">Historial de Movimientos</h3>
          <span class="badge bg-secondary">
            Mostrando {{ movimientosVisibles.length }} de {{ movimientosFiltrados.length }} movimientos
          </span>
        </div>

        <!-- BARRA DE FILTROS Y ORDENAMIENTO -->
        <div class="p-3 mb-4 rounded-4 border border-secondary border-opacity-25" style="background-color: #1a1a1a;">
          <div class="row g-3 align-items-end">
            <!-- Ordenar por valor -->
            <div class="col-sm-6 col-md-4 col-lg-2">
              <label class="form-label text-white-50 small mb-1">Ordenar por valor</label>
              <select v-model="ordenValor" class="form-select form-select-sm bg-dark text-white border-secondary">
                <option value="">Más recientes</option>
                <option value="desc">Mayor a menor ($)</option>
                <option value="asc">Menor a mayor ($)</option>
              </select>
            </div>

            <!-- Filtrar por tipo de pago -->
            <div class="col-sm-6 col-md-4 col-lg-3">
              <label class="form-label text-white-50 small mb-1">Tipo de pago</label>
              <select v-model="filtroTipoPago" class="form-select form-select-sm bg-dark text-white border-secondary">
                <option value="">Todos los tipos</option>
                <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                <option value="Tarjeta de Débito">Tarjeta de Débito</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
              </select>
            </div>

            <!-- Filtrar por mes -->
            <div class="col-sm-6 col-md-4 col-lg-2">
              <label class="form-label text-white-50 small mb-1">Mes</label>
              <select v-model="filtroMes" class="form-select form-select-sm bg-dark text-white border-secondary">
                <option value="">Todos</option>
                <option v-for="mes in mesesNombres" :key="mes.valor" :value="mes.valor">
                  {{ mes.nombre }}
                </option>
              </select>
            </div>

            <!-- Filtrar por año -->
            <div class="col-sm-6 col-md-4 col-lg-2">
              <label class="form-label text-white-50 small mb-1">Año</label>
              <select v-model="filtroAnio" class="form-select form-select-sm bg-dark text-white border-secondary">
                <option value="">Todos</option>
                <option v-for="anio in aniosDisponibles" :key="anio" :value="anio">
                  {{ anio }}
                </option>
              </select>
            </div>

            <!-- Filtrar por últimos X meses -->
            <div class="col-sm-6 col-md-4 col-lg-2">
              <label class="form-label text-white-50 small mb-1">Período reciente</label>
              <select v-model="filtroUltimosMeses" class="form-select form-select-sm bg-dark text-white border-secondary">
                <option value="">Cualquier fecha</option>
                <option value="1">Último mes</option>
                <option value="2">Últimos 2 meses</option>
                <option value="3">Últimos 3 meses</option>
                <option value="6">Últimos 6 meses</option>
                <option value="12">Últimos 12 meses</option>
              </select>
            </div>

            <!-- Botón limpiar filtros -->
            <div class="col-sm-6 col-md-4 col-lg-1 d-grid">
              <button 
                @click="limpiarFiltros" 
                type="button" 
                class="btn btn-sm fw-bold rounded-3"
                :class="hayFiltrosActivos ? 'text-white' : 'btn-outline-secondary'"
                :style="hayFiltrosActivos ? 'background-color: #FF5722;' : ''"
                :disabled="!hayFiltrosActivos"
                title="Limpiar todos los filtros"
              >
                <i class="bi bi-arrow-counterclockwise"></i> Limpiar
              </button>
            </div>
          </div>
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
                <tr v-for="movimiento in movimientosVisibles" :key="movimiento.id">
                  <td class="p-3">{{ movimiento.concepto }}</td>
                  <td class="p-3"><span class="badge bg-secondary">{{ movimiento.tipoPago }}</span></td>
                  <td class="p-3 fw-bold">${{ Math.round(movimiento.monto) }}</td>
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
                <tr v-if="movimientosVisibles.length === 0">
                  <td colspan="5" class="p-4 text-center text-white-50">
                    No se encontraron movimientos con los filtros seleccionados.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- BOTÓN CARGAR MÁS AL FINAL DE LA TABLA -->
          <div 
            v-if="restantesPorCargar > 0" 
            class="p-3 text-center border-top border-secondary border-opacity-25" 
            style="background-color: #1a1a1a;"
          >
            <button 
              @click="cargarMas" 
              type="button" 
              class="btn btn-outline-light rounded-pill px-4 fw-bold"
            >
              <i class="bi bi-plus-circle me-1"></i> Cargar más ({{ restantesPorCargar }} restantes)
            </button>
          </div>
        </div>

        <!-- TARJETAS DE RESUMEN DE TOTALES CALCULADAS DINÁMICAMENTE -->
        <div class="row g-3 mb-4">
          <div class="col-md-4">
            <div class="p-3 rounded-4 border border-secondary border-opacity-25 text-center" style="background-color: #1a1a1a;">
              <p class="text-white-50 small mb-1">Total Pagado (Filtrado)</p>
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
              <input v-model.number="formEdit.monto" type="number" step="1" min="1" class="form-control bg-dark text-white border-secondary" required>
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
                <span class="fw-bold text-danger">${{ Math.round(movimientoAEliminar?.monto || 0) }}</span>
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