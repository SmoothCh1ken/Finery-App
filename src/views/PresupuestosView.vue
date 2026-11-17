<script setup>
import { ref, computed } from 'vue'
import Sidebar from '../components/Sidebar.vue'

// ==========================================
// 1. PRESUPUESTO MENSUAL TOTAL (SALARIO)
// ==========================================
const salarioTotal = ref(2500)

// ==========================================
// 2. PRESUPUESTOS (PORCENTAJES)
// ==========================================
const presupuestos = ref([
  { id: 1, nombre: 'Presupuesto de Alquiler', porcentaje: 40 },
  { id: 2, nombre: 'Presupuesto de Ahorro', porcentaje: 25 },
  { id: 3, nombre: 'Presupuesto de Alimentación', porcentaje: 25 }
])

const porcentajeTotalAsignado = computed(() => {
  return presupuestos.value.reduce((total, p) => total + Number(p.porcentaje || 0), 0)
})

const porcentajeDisponible = computed(() => {
  const disp = 100 - porcentajeTotalAsignado.value
  return disp < 0 ? 0 : disp
})

const montoTotalAsignado = computed(() => {
  return (salarioTotal.value * porcentajeTotalAsignado.value) / 100
})

const montoDisponible = computed(() => {
  return (salarioTotal.value * porcentajeDisponible.value) / 100
})

const calcularMonto = (porcentaje) => {
  if (!salarioTotal.value || salarioTotal.value <= 0) return 0
  return (salarioTotal.value * (porcentaje || 0)) / 100
}

// Restricción de sliders en tiempo real (máximo 100% acumulado)
const validarPorcentaje = (presupuestoActual) => {
  const sumaOtros = presupuestos.value.reduce((total, p) => {
    return p.id !== presupuestoActual.id ? total + Number(p.porcentaje || 0) : total
  }, 0)

  const maxPermitido = Math.max(0, 100 - sumaOtros)

  if (presupuestoActual.porcentaje > maxPermitido) {
    presupuestoActual.porcentaje = maxPermitido
  }
  if (presupuestoActual.porcentaje < 0 || isNaN(presupuestoActual.porcentaje)) {
    presupuestoActual.porcentaje = 0
  }
}

// Modal: Agregar Presupuesto
const mostrarModal = ref(false)
const nuevoNombre = ref('')
const nuevoPorcentaje = ref(10)
const errorModal = ref('')

const abrirModal = () => {
  nuevoNombre.value = ''
  nuevoPorcentaje.value = porcentajeDisponible.value > 10 ? 10 : porcentajeDisponible.value
  errorModal.value = ''
  mostrarModal.value = true
}

const cerrarModal = () => {
  mostrarModal.value = false
}

const agregarPresupuesto = () => {
  if (!nuevoNombre.value.trim()) {
    errorModal.value = 'Ingresa un nombre para el presupuesto.'
    return
  }
  if (nuevoPorcentaje.value <= 0) {
    errorModal.value = 'El porcentaje debe ser mayor a 0%.'
    return
  }
  if (nuevoPorcentaje.value > porcentajeDisponible.value) {
    errorModal.value = `El porcentaje supera el disponible (${porcentajeDisponible.value}% libre).`
    return
  }

  presupuestos.value.push({
    id: Date.now(),
    nombre: nuevoNombre.value.trim(),
    porcentaje: Number(nuevoPorcentaje.value)
  })

  cerrarModal()
}

// Modal: Editar Presupuesto al cliquear la tarjeta
const mostrarModalEditarPresupuesto = ref(false)
const errorEditarPresupuesto = ref('')
const formEditPresupuesto = ref({
  id: null,
  nombre: '',
  porcentaje: 0,
  montoEspecifico: 0,
  maxPermitido: 100
})

const abrirEditarPresupuesto = (p) => {
  const sumaOtros = presupuestos.value.reduce((total, item) => {
    return item.id !== p.id ? total + Number(item.porcentaje || 0) : total
  }, 0)

  formEditPresupuesto.value = {
    id: p.id,
    nombre: p.nombre,
    porcentaje: p.porcentaje,
    montoEspecifico: Math.round(calcularMonto(p.porcentaje)),
    maxPermitido: Math.max(0, 100 - sumaOtros)
  }
  errorEditarPresupuesto.value = ''
  mostrarModalEditarPresupuesto.value = true
}

const sincronizarDesdePorcentaje = () => {
  let pct = Number(formEditPresupuesto.value.porcentaje || 0)
  if (pct < 0) pct = 0
  if (pct > formEditPresupuesto.value.maxPermitido) {
    pct = formEditPresupuesto.value.maxPermitido
    formEditPresupuesto.value.porcentaje = pct
  }
  formEditPresupuesto.value.montoEspecifico = Math.round(calcularMonto(pct))
}

const sincronizarDesdeMonto = () => {
  if (!salarioTotal.value || salarioTotal.value <= 0) return
  let monto = Math.round(Number(formEditPresupuesto.value.montoEspecifico || 0))
  if (monto < 0) monto = 0
  let pctCalculado = Math.round((monto / salarioTotal.value) * 100)
  if (pctCalculado > formEditPresupuesto.value.maxPermitido) {
    pctCalculado = formEditPresupuesto.value.maxPermitido
  }
  formEditPresupuesto.value.porcentaje = pctCalculado
}

const guardarEdicionPresupuesto = () => {
  if (!formEditPresupuesto.value.nombre.trim()) {
    errorEditarPresupuesto.value = 'El nombre del presupuesto no puede estar vacío.'
    return
  }
  if (formEditPresupuesto.value.porcentaje < 0 || formEditPresupuesto.value.porcentaje > formEditPresupuesto.value.maxPermitido) {
    errorEditarPresupuesto.value = `El porcentaje debe estar entre 0% y ${formEditPresupuesto.value.maxPermitido}%.`
    return
  }

  const index = presupuestos.value.findIndex(p => p.id === formEditPresupuesto.value.id)
  if (index !== -1) {
    presupuestos.value[index] = {
      id: formEditPresupuesto.value.id,
      nombre: formEditPresupuesto.value.nombre.trim(),
      porcentaje: Number(formEditPresupuesto.value.porcentaje)
    }
  }
  mostrarModalEditarPresupuesto.value = false
}

// ==========================================
// 3. METAS PERSONALES
// ==========================================
const metas = ref([
  { id: 1, nombre: 'Presupuesto Carro Nuevo', valorTotal: 10000, valorActual: 4000 }
])

const calcularPorcentajeMeta = (meta) => {
  if (!meta || !meta.valorTotal || meta.valorTotal <= 0) return 0
  const pct = (Number(meta.valorActual || 0) / Number(meta.valorTotal)) * 100
  return Math.min(100, Math.max(0, Math.round(pct)))
}

const calcularFaltanteMeta = (meta) => {
  if (!meta) return 0
  const faltante = Number(meta.valorTotal || 0) - Number(meta.valorActual || 0)
  return faltante > 0 ? faltante : 0
}

// Modal: Agregar Nueva Meta Personal
const mostrarModalMeta = ref(false)
const nuevaMetaNombre = ref('')
const nuevaMetaTotal = ref(1000)
const nuevaMetaActual = ref(0)
const errorModalMeta = ref('')

const abrirModalMeta = () => {
  nuevaMetaNombre.value = ''
  nuevaMetaTotal.value = 1000
  nuevaMetaActual.value = 0
  errorModalMeta.value = ''
  mostrarModalMeta.value = true
}

const agregarMetaPersonal = () => {
  if (!nuevaMetaNombre.value.trim()) {
    errorModalMeta.value = 'Ingresa un nombre para la meta personal.'
    return
  }
  if (!nuevaMetaTotal.value || nuevaMetaTotal.value <= 0) {
    errorModalMeta.value = 'El valor total de la meta debe ser mayor a $0.'
    return
  }
  if (nuevaMetaActual.value < 0) {
    errorModalMeta.value = 'El valor actual no puede ser negativo.'
    return
  }

  metas.value.push({
    id: Date.now(),
    nombre: nuevaMetaNombre.value.trim(),
    valorTotal: Math.round(Number(nuevaMetaTotal.value)),
    valorActual: Math.round(Number(nuevaMetaActual.value || 0))
  })

  mostrarModalMeta.value = false
}

// Modal: Gestionar Meta (Agregar Monto o Editar Valores) al cliquear tarjeta
const mostrarModalGestionMeta = ref(false)
const montoAbonarMeta = ref(null)
const errorGestionMeta = ref('')
const formEditMeta = ref({
  id: null,
  nombre: '',
  valorTotal: 0,
  valorActual: 0
})

const abrirGestionMeta = (meta) => {
  formEditMeta.value = {
    id: meta.id,
    nombre: meta.nombre,
    valorTotal: Math.round(meta.valorTotal),
    valorActual: Math.round(meta.valorActual)
  }
  montoAbonarMeta.value = null
  errorGestionMeta.value = ''
  mostrarModalGestionMeta.value = true
}

const abonarAMeta = () => {
  if (!montoAbonarMeta.value || montoAbonarMeta.value <= 0) {
    errorGestionMeta.value = 'Ingresa un monto válido mayor a $0 para agregar.'
    return
  }
  formEditMeta.value.valorActual = Math.round(Number(formEditMeta.value.valorActual) + Number(montoAbonarMeta.value))
  montoAbonarMeta.value = null
  errorGestionMeta.value = ''
  guardarEdicionMeta()
}

const guardarEdicionMeta = () => {
  if (!formEditMeta.value.nombre.trim()) {
    errorGestionMeta.value = 'El nombre de la meta no puede estar vacío.'
    return
  }
  if (!formEditMeta.value.valorTotal || formEditMeta.value.valorTotal <= 0) {
    errorGestionMeta.value = 'El valor total debe ser mayor a $0.'
    return
  }
  if (formEditMeta.value.valorActual < 0) {
    errorGestionMeta.value = 'El valor actual no puede ser negativo.'
    return
  }

  const index = metas.value.findIndex(m => m.id === formEditMeta.value.id)
  if (index !== -1) {
    metas.value[index] = {
      id: formEditMeta.value.id,
      nombre: formEditMeta.value.nombre.trim(),
      valorTotal: Math.round(Number(formEditMeta.value.valorTotal)),
      valorActual: Math.round(Number(formEditMeta.value.valorActual))
    }
  }
  mostrarModalGestionMeta.value = false
}

// ==========================================
// 4. DOBLE CONFIRMACIÓN DE ELIMINACIÓN (UNIFICADA)
// ==========================================
const pasodeEliminacion = ref(0) // 0: cerrado, 1: paso 1, 2: paso final
const tipoEliminacion = ref('') // 'presupuesto' | 'meta'
const itemAEliminar = ref(null)

const iniciarEliminacion = (item, tipo) => {
  itemAEliminar.value = item
  tipoEliminacion.value = tipo
  pasodeEliminacion.value = 1
}

const avanzarSegundaConfirmacion = () => {
  pasodeEliminacion.value = 2
}

const confirmarEliminacionDefinitiva = () => {
  if (itemAEliminar.value) {
    if (tipoEliminacion.value === 'presupuesto') {
      presupuestos.value = presupuestos.value.filter(p => p.id !== itemAEliminar.value.id)
    } else if (tipoEliminacion.value === 'meta') {
      metas.value = metas.value.filter(m => m.id !== itemAEliminar.value.id)
    }
  }
  cancelarEliminacion()
}

const cancelarEliminacion = () => {
  itemAEliminar.value = null
  tipoEliminacion.value = ''
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
          <h2 class="fw-bold">Administra tus presupuestos.</h2>
          <p class="text-white-50">Maneja tus presupuestos financieros fácilmente.</p>
        </div>

        <hr class="mb-4">

        <!-- PRESUPUESTO MENSUAL TOTAL (SALARIO) -->
        <div class="row g-3 mb-5 p-4 rounded-4 border border-secondary border-opacity-25 align-items-center" style="background-color: #1a1a1a;">
          <div class="col-md-5">
            <label class="form-label text-white-50 fw-bold small">PRESUPUESTO MENSUAL TOTAL (SALARIO)</label>
            <div class="input-group">
              <span class="input-group-text bg-dark text-white border-secondary">$</span>
              <input 
                v-model.number="salarioTotal" 
                type="number" 
                class="form-control form-control-lg bg-dark text-white border-secondary fw-bold" 
                placeholder="0" 
                min="0" 
                step="10"
              >
            </div>
          </div>

          <div class="col-md-7">
            <div class="d-flex justify-content-around text-center p-2 rounded-3 border border-secondary border-opacity-25" style="background-color: #0a0a0a;">
              <div>
                <p class="text-white-50 small mb-1">Total Asignado</p>
                <h5 class="fw-bold text-white mb-0">
                  {{ porcentajeTotalAsignado }}%
                  <span class="fs-6 text-white-50">(${{ Math.round(montoTotalAsignado) }})</span>
                </h5>
              </div>

              <div class="border-start border-secondary border-opacity-50 ps-3">
                <p class="text-white-50 small mb-1">Disponible sin Asignar</p>
                <h5 class="fw-bold mb-0" :class="porcentajeDisponible === 0 ? 'text-warning' : 'text-success'">
                  {{ porcentajeDisponible }}%
                  <span class="fs-6 opacity-75">(${{ Math.round(montoDisponible) }})</span>
                </h5>
              </div>
            </div>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- SECCIÓN DE PRESUPUESTOS                    -->
        <!-- ========================================== -->
        <div class="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h3 class="fw-bold mb-0">Presupuestos</h3>
            <small class="text-white-50">Haz clic sobre una tarjeta para editar su nombre o valores específicos.</small>
          </div>
          <span class="badge" :class="porcentajeTotalAsignado >= 100 ? 'bg-danger' : 'bg-secondary'">
            Total asignado: {{ porcentajeTotalAsignado }} / 100%
          </span>
        </div>
        
        <button @click="abrirModal" type="button" class="btn text-white w-100 fw-bold rounded-3 mb-4" style="background-color: #FF5722;">
          + Agregar Presupuesto
        </button>

        <!-- TARJETAS DE PRESUPUESTOS -->
        <div class="row g-3 mb-5">
          <div v-for="p in presupuestos" :key="p.id" class="col-md-4 col-lg-3">
            <div 
              @click="abrirEditarPresupuesto(p)" 
              class="p-3 rounded-4 border border-secondary border-opacity-25 text-center position-relative card-interactiva h-100" 
              style="background-color: #1a1a1a;"
              title="Haz clic para editar este presupuesto"
            >
              <!-- BOTÓN ELIMINAR -->
              <button 
                @click.stop="iniciarEliminacion(p, 'presupuesto')" 
                class="btn btn-sm btn-link text-white-50 text-decoration-none position-absolute top-0 end-0 m-2"
                title="Eliminar Presupuesto"
              >
                <i class="bi bi-x-circle-fill fs-5"></i>
              </button>

              <div class="text-center p-2">
                <!-- GRÁFICO SVG DINÁMICO -->
                <div class="position-relative d-inline-flex align-items-center justify-content-center my-3">
                  <svg width="130" height="130" viewBox="0 0 36 36" class="circular-chart">
                    <path 
                      class="circle-bg" 
                      stroke="#2c2c2c" 
                      stroke-width="3.5" 
                      fill="none" 
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                    />
                    <path 
                      class="circle" 
                      stroke="#FF5722" 
                      stroke-width="3.5" 
                      :stroke-dasharray="`${p.porcentaje}, 100`" 
                      stroke-linecap="round" 
                      fill="none" 
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                    />
                  </svg>
                  <span class="position-absolute fs-3 fw-bold text-white">{{ p.porcentaje }}%</span>
                </div>

                <p class="text-white mb-1 fw-bold">{{ p.nombre }}</p>

                <!-- EQUIVALENCIA EN DINERO -->
                <p class="fs-5 fw-bold mb-3" style="color: #FF5722;">
                  ${{ Math.round(calcularMonto(p.porcentaje)) }}
                </p>

                <label class="form-label text-white-50 small">Ajustar Porcentaje</label>
                
                <!-- RANGE SLIDER -->
                <input 
                  v-model.number="p.porcentaje" 
                  @input="validarPorcentaje(p)"
                  @click.stop
                  type="range" 
                  class="form-range" 
                  min="0" 
                  max="100"
                >
              </div>
            </div>
          </div>

          <div v-if="presupuestos.length === 0" class="col-12">
            <div class="p-4 rounded-4 border border-secondary border-opacity-25 text-center text-white-50" style="background-color: #1a1a1a;">
              No tienes presupuestos creados. ¡Haz clic en "+ Agregar Presupuesto" para comenzar!
            </div>
          </div>
        </div>

        <hr class="mb-4">

        <!-- ========================================== -->
        <!-- SECCIÓN DE METAS PERSONALES                -->
        <!-- ========================================== -->
        <div class="mb-3">
          <h3 class="fw-bold mb-0">Metas personales</h3>
          <small class="text-white-50">Haz clic sobre una meta para abonar dinero o editar sus valores.</small>
        </div>
        
        <button @click="abrirModalMeta" type="button" class="btn text-white w-100 fw-bold rounded-3 mb-4" style="background-color: #FF5722;">
          + Agregar Meta Personal
        </button>

        <!-- TARJETAS DE METAS PERSONALES (SIN SLIDERS) -->
        <div class="row g-3 mb-4">
          <div v-for="meta in metas" :key="meta.id" class="col-md-4 col-lg-3">
            <div 
              @click="abrirGestionMeta(meta)" 
              class="p-3 rounded-4 border border-secondary border-opacity-25 text-center position-relative card-interactiva h-100 d-flex flex-column justify-content-between" 
              style="background-color: #1a1a1a;"
              title="Haz clic para agregar monto o editar esta meta"
            >
              <!-- BOTÓN ELIMINAR CON DOBLE CONFIRMACIÓN -->
              <button 
                @click.stop="iniciarEliminacion(meta, 'meta')" 
                class="btn btn-sm btn-link text-white-50 text-decoration-none position-absolute top-0 end-0 m-2"
                title="Eliminar Meta Personal"
              >
                <i class="bi bi-x-circle-fill fs-5"></i>
              </button>

              <div class="text-center p-2">
                <p class="text-white-50 mb-2 small">Porcentaje alcanzado:</p>
                
                <!-- GRÁFICO CIRCULAR SVG -->
                <div class="position-relative d-inline-flex align-items-center justify-content-center mb-3">
                  <svg width="120" height="120" viewBox="0 0 36 36">
                    <path 
                      stroke="#2c2c2c" 
                      stroke-width="3.5" 
                      fill="none" 
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                    />
                    <path 
                      class="circle"
                      :stroke="calcularPorcentajeMeta(meta) >= 100 ? '#198754' : '#FF5722'" 
                      stroke-width="3.5" 
                      :stroke-dasharray="`${calcularPorcentajeMeta(meta)}, 100`" 
                      stroke-linecap="round" 
                      fill="none" 
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                    />
                  </svg>
                  <span class="position-absolute fs-4 fw-bold text-white">
                    {{ calcularPorcentajeMeta(meta) }}%
                  </span>
                </div>

                <!-- NOMBRE DE LA META -->
                <p class="text-white mb-2 fw-bold fs-5">{{ meta.nombre }}</p>

                <!-- PROGRESO MONETARIO (ACTUAL / TOTAL) -->
                <div class="p-2 rounded-3 mb-2" style="background-color: #121212;">
                  <span class="fw-bold text-white">${{ Math.round(Number(meta.valorActual)) }}</span>
                  <span class="text-white-50 small"> / ${{ Math.round(Number(meta.valorTotal)) }}</span>
                </div>
              </div>

              <!-- MENSAJE DE MONTO FALTANTE PARA LLEGAR A LA META -->
              <div class="pt-2 border-top border-secondary border-opacity-25">
                <p v-if="calcularFaltanteMeta(meta) > 0" class="mb-0 fw-bold small" style="color: #FF5722;">
                  ¡Solo ${{ Math.round(calcularFaltanteMeta(meta)) }} para llegar a la meta!
                </p>
                <p v-else class="mb-0 fw-bold small text-success">
                  <i class="bi bi-check-circle-fill me-1"></i> ¡Meta completada!
                </p>
              </div>
            </div>
          </div>

          <div v-if="metas.length === 0" class="col-12">
            <div class="p-4 rounded-4 border border-secondary border-opacity-25 text-center text-white-50" style="background-color: #1a1a1a;">
              No tienes metas personales registradas. ¡Haz clic en "+ Agregar Meta Personal" para crear una!
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>

  <!-- ========================================== -->
  <!-- MODAL 1: AGREGAR NUEVO PRESUPUESTO         -->
  <!-- ========================================== -->
  <div v-if="mostrarModal" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.85); z-index: 1050;">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content bg-dark text-white border border-secondary rounded-4">
        <div class="modal-header border-secondary">
          <h5 class="modal-title fw-bold">Nuevo Presupuesto</h5>
          <button type="button" class="btn-close btn-close-white" @click="cerrarModal"></button>
        </div>
        <div class="modal-body">
          <div v-if="errorModal" class="alert alert-danger py-2 small mb-3">
            {{ errorModal }}
          </div>
          
          <div class="mb-3">
            <label class="form-label text-white-50 small">Nombre del Presupuesto</label>
            <input v-model="nuevoNombre" type="text" class="form-control bg-dark text-white border-secondary" placeholder="Ej: Entretenimiento, Servicios..." required>
          </div>

          <div class="mb-3">
            <label class="form-label text-white-50 small">
              Porcentaje Inicial (Disponible: {{ porcentajeDisponible }}%)
            </label>
            <input 
              v-model.number="nuevoPorcentaje" 
              type="number" 
              min="1" 
              :max="porcentajeDisponible" 
              class="form-control bg-dark text-white border-secondary"
            >
          </div>

          <div class="p-3 mb-3 rounded-3 border border-secondary border-opacity-25" style="background-color: #1a1a1a;">
            <span class="text-white-50 small d-block mb-1">Monto calculado estimado:</span>
            <span class="fs-4 fw-bold" style="color: #FF5722;">
              ${{ Math.round(calcularMonto(nuevoPorcentaje)) }}
            </span>
          </div>

          <div class="d-flex justify-content-end gap-2 mt-4">
            <button type="button" class="btn btn-outline-secondary rounded-3" @click="cerrarModal">Cancelar</button>
            <button type="button" class="btn text-white fw-bold rounded-3" style="background-color: #FF5722;" @click="agregarPresupuesto">
              Crear Presupuesto
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ========================================== -->
  <!-- MODAL 2: EDITAR PRESUPUESTO EXISTENTE      -->
  <!-- ========================================== -->
  <div v-if="mostrarModalEditarPresupuesto" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.85); z-index: 1050;">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content bg-dark text-white border border-secondary rounded-4">
        <div class="modal-header border-secondary">
          <h5 class="modal-title fw-bold">Editar Presupuesto</h5>
          <button type="button" class="btn-close btn-close-white" @click="mostrarModalEditarPresupuesto = false"></button>
        </div>
        <div class="modal-body">
          <div v-if="errorEditarPresupuesto" class="alert alert-danger py-2 small mb-3">
            {{ errorEditarPresupuesto }}
          </div>

          <div class="mb-3">
            <label class="form-label text-white-50 small">Nombre del Presupuesto</label>
            <input v-model="formEditPresupuesto.nombre" type="text" class="form-control bg-dark text-white border-secondary" required>
          </div>

          <div class="row g-3 mb-3">
            <div class="col-6">
              <label class="form-label text-white-50 small">
                Porcentaje (Máx: {{ formEditPresupuesto.maxPermitido }}%)
              </label>
              <div class="input-group">
                <input 
                  v-model.number="formEditPresupuesto.porcentaje" 
                  @input="sincronizarDesdePorcentaje"
                  type="number" 
                  min="0" 
                  :max="formEditPresupuesto.maxPermitido" 
                  class="form-control bg-dark text-white border-secondary fw-bold"
                >
                <span class="input-group-text bg-dark text-white border-secondary">%</span>
              </div>
            </div>

            <div class="col-6">
              <label class="form-label text-white-50 small">Monto Específico ($)</label>
              <div class="input-group">
                <span class="input-group-text bg-dark text-white border-secondary">$</span>
                <input 
                  v-model.number="formEditPresupuesto.montoEspecifico" 
                  @input="sincronizarDesdeMonto"
                  type="number" 
                  min="0" 
                  step="1"
                  class="form-control bg-dark text-white border-secondary fw-bold"
                >
              </div>
            </div>
          </div>

          <div class="p-3 mb-3 rounded-3 border border-secondary border-opacity-25" style="background-color: #1a1a1a;">
            <span class="text-white-50 small d-block mb-1">Asignación resultante sobre salario (${{ Math.round(salarioTotal) }}):</span>
            <span class="fs-4 fw-bold" style="color: #FF5722;">
              {{ formEditPresupuesto.porcentaje }}% (${{ Math.round(calcularMonto(formEditPresupuesto.porcentaje)) }})
            </span>
          </div>

          <div class="d-flex justify-content-end gap-2 mt-4">
            <button type="button" class="btn btn-outline-secondary rounded-3" @click="mostrarModalEditarPresupuesto = false">Cancelar</button>
            <button type="button" class="btn text-white fw-bold rounded-3" style="background-color: #FF5722;" @click="guardarEdicionPresupuesto">
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ========================================== -->
  <!-- MODAL 3: AGREGAR NUEVA META PERSONAL       -->
  <!-- ========================================== -->
  <div v-if="mostrarModalMeta" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.85); z-index: 1050;">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content bg-dark text-white border border-secondary rounded-4">
        <div class="modal-header border-secondary">
          <h5 class="modal-title fw-bold">Nueva Meta Personal</h5>
          <button type="button" class="btn-close btn-close-white" @click="mostrarModalMeta = false"></button>
        </div>
        <div class="modal-body">
          <div v-if="errorModalMeta" class="alert alert-danger py-2 small mb-3">
            {{ errorModalMeta }}
          </div>

          <div class="mb-3">
            <label class="form-label text-white-50 small">Nombre de la Meta</label>
            <input v-model="nuevaMetaNombre" type="text" class="form-control bg-dark text-white border-secondary" placeholder="Ej: Fondo de Emergencia, Laptop..." required>
          </div>

          <div class="row g-3 mb-3">
            <div class="col-6">
              <label class="form-label text-white-50 small">Valor Total de la Meta ($)</label>
              <div class="input-group">
                <span class="input-group-text bg-dark text-white border-secondary">$</span>
                <input v-model.number="nuevaMetaTotal" type="number" min="1" step="1" class="form-control bg-dark text-white border-secondary">
              </div>
            </div>

            <div class="col-6">
              <label class="form-label text-white-50 small">Valor Actual Ahorrado ($)</label>
              <div class="input-group">
                <span class="input-group-text bg-dark text-white border-secondary">$</span>
                <input v-model.number="nuevaMetaActual" type="number" min="0" step="1" class="form-control bg-dark text-white border-secondary">
              </div>
            </div>
          </div>

          <div class="p-3 mb-3 rounded-3 border border-secondary border-opacity-25 d-flex justify-content-between align-items-center" style="background-color: #1a1a1a;">
            <div>
              <span class="text-white-50 small d-block">Porcentaje inicial:</span>
              <span class="fs-4 fw-bold" style="color: #FF5722;">
                {{ nuevaMetaTotal > 0 ? Math.min(100, Math.max(0, Math.round((nuevaMetaActual / nuevaMetaTotal) * 100))) : 0 }}%
              </span>
            </div>
            <div class="text-end">
              <span class="text-white-50 small d-block">Faltante:</span>
              <span class="fw-bold text-white">
                ${{ Math.round(Math.max(0, (nuevaMetaTotal || 0) - (nuevaMetaActual || 0))) }}
              </span>
            </div>
          </div>

          <div class="d-flex justify-content-end gap-2 mt-4">
            <button type="button" class="btn btn-outline-secondary rounded-3" @click="mostrarModalMeta = false">Cancelar</button>
            <button type="button" class="btn text-white fw-bold rounded-3" style="background-color: #FF5722;" @click="agregarMetaPersonal">
              Crear Meta
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ========================================== -->
  <!-- MODAL 4: GESTIONAR META (ABONAR / EDITAR)  -->
  <!-- ========================================== -->
  <div v-if="mostrarModalGestionMeta" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.85); z-index: 1050;">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content bg-dark text-white border border-secondary rounded-4">
        <div class="modal-header border-secondary">
          <h5 class="modal-title fw-bold">Gestionar Meta Personal</h5>
          <button type="button" class="btn-close btn-close-white" @click="mostrarModalGestionMeta = false"></button>
        </div>
        <div class="modal-body">
          <div v-if="errorGestionMeta" class="alert alert-danger py-2 small mb-3">
            {{ errorGestionMeta }}
          </div>

          <!-- SECCIÓN A: ABONO RÁPIDO AL VALOR ACTUAL -->
          <div class="p-3 mb-4 rounded-4 border border-secondary border-opacity-50" style="background-color: #1a1a1a;">
            <label class="form-label fw-bold small mb-2" style="color: #FF5722;">
              <i class="bi bi-plus-circle-fill me-1"></i> AGREGAR MONTO AL AHORRO ACTUAL
            </label>
            <div class="input-group">
              <span class="input-group-text bg-dark text-white border-secondary">$</span>
              <input 
                v-model.number="montoAbonarMeta" 
                type="number" 
                min="1" 
                step="1" 
                class="form-control bg-dark text-white border-secondary" 
                placeholder="Ej: 150"
              >
              <button @click="abonarAMeta" type="button" class="btn text-white fw-bold" style="background-color: #FF5722;">
                Abonar
              </button>
            </div>
          </div>

          <!-- SECCIÓN B: EDITAR CUALQUIER VALOR DE LA TARJETA -->
          <h6 class="fw-bold text-white-50 small mb-3">O EDITAR DATOS DE LA META</h6>

          <div class="mb-3">
            <label class="form-label text-white-50 small">Nombre de la Meta</label>
            <input v-model="formEditMeta.nombre" type="text" class="form-control bg-dark text-white border-secondary" required>
          </div>

          <div class="row g-3 mb-3">
            <div class="col-6">
              <label class="form-label text-white-50 small">Valor Actual ($)</label>
              <div class="input-group">
                <span class="input-group-text bg-dark text-white border-secondary">$</span>
                <input v-model.number="formEditMeta.valorActual" type="number" min="0" step="1" class="form-control bg-dark text-white border-secondary">
              </div>
            </div>

            <div class="col-6">
              <label class="form-label text-white-50 small">Valor Total ($)</label>
              <div class="input-group">
                <span class="input-group-text bg-dark text-white border-secondary">$</span>
                <input v-model.number="formEditMeta.valorTotal" type="number" min="1" step="1" class="form-control bg-dark text-white border-secondary">
              </div>
            </div>
          </div>

          <div class="p-3 mb-3 rounded-3 border border-secondary border-opacity-25 d-flex justify-content-between align-items-center" style="background-color: #121212;">
            <div>
              <span class="text-white-50 small d-block">Nuevo Progreso:</span>
              <span class="fs-5 fw-bold" style="color: #FF5722;">
                {{ calcularPorcentajeMeta(formEditMeta) }}%
              </span>
            </div>
            <div class="text-end">
              <span class="text-white-50 small d-block">Faltante para la meta:</span>
              <span class="fw-bold text-white">
                ${{ Math.round(calcularFaltanteMeta(formEditMeta)) }}
              </span>
            </div>
          </div>

          <div class="d-flex justify-content-end gap-2 mt-4">
            <button type="button" class="btn btn-outline-secondary rounded-3" @click="mostrarModalGestionMeta = false">Cancelar</button>
            <button type="button" class="btn text-white fw-bold rounded-3" style="background-color: #FF5722;" @click="guardarEdicionMeta">
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ========================================== -->
  <!-- MODAL 5: DOBLE CONFIRMACIÓN DE ELIMINACIÓN -->
  <!-- ========================================== -->
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
          <p class="fs-5 mb-3">
            ¿Estás seguro de que deseas eliminar {{ tipoEliminacion === 'presupuesto' ? 'este presupuesto' : 'esta meta personal' }}?
          </p>
          <div class="p-3 mb-4 rounded-3 border border-secondary text-start" style="background-color: #1a1a1a;">
            <p class="mb-1 text-white-50 small">Nombre:</p>
            <p class="fw-bold mb-2 fs-5">{{ itemAEliminar?.nombre }}</p>
            
            <!-- Detalles si es Presupuesto -->
            <div v-if="tipoEliminacion === 'presupuesto'" class="d-flex justify-content-between align-items-center">
              <div>
                <span class="text-white-50 small">Porcentaje asignado: </span>
                <span class="fw-bold text-warning">{{ itemAEliminar?.porcentaje }}%</span>
              </div>
              <div>
                <span class="text-white-50 small">Monto mensual: </span>
                <span class="fw-bold text-danger">${{ Math.round(calcularMonto(itemAEliminar?.porcentaje)) }}</span>
              </div>
            </div>

            <!-- Detalles si es Meta Personal -->
            <div v-if="tipoEliminacion === 'meta'" class="d-flex justify-content-between align-items-center">
              <div>
                <span class="text-white-50 small">Progreso: </span>
                <span class="fw-bold text-warning">
                  ${{ Math.round(Number(itemAEliminar?.valorActual)) }} / ${{ Math.round(Number(itemAEliminar?.valorTotal)) }}
                </span>
              </div>
              <div>
                <span class="text-white-50 small">Completado: </span>
                <span class="fw-bold text-danger">{{ calcularPorcentajeMeta(itemAEliminar) }}%</span>
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
          <p class="text-white-50 mb-4">
            Esta acción eliminará de forma permanente 
            <strong>"{{ itemAEliminar?.nombre }}"</strong>. ¿Deseas proceder?
          </p>
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

<style scoped>
.circle {
  transition: stroke-dasharray 0.25s ease-out;
}

.card-interactiva {
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.card-interactiva:hover {
  transform: translateY(-3px);
  border-color: #FF5722 !important;
}
</style>