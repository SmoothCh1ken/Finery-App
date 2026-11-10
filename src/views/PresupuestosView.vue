<script setup>
import { ref, computed } from 'vue'
import Sidebar from '../components/Sidebar.vue'

// 1. PRESUPUESTO MENSUAL TOTAL (SALARIO)
const salarioTotal = ref(2500.00)

// 2. LISTA REACTIVA DE PRESUPUESTOS (Suma inicial: 90%)
const presupuestos = ref([
  { id: 1, nombre: 'Presupuesto de Alquiler', porcentaje: 40 },
  { id: 2, nombre: 'Presupuesto de Ahorro', porcentaje: 25 },
  { id: 3, nombre: 'Presupuesto de Alimentación', porcentaje: 25 }
])

// 3. CÁLCULOS COMPUTADOS
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

// 4. CONTROL Y RESTRICCIÓN DE SLIDERS (SOLUCIÓN PUNTOS 2 Y 3)
// Mantiene el max del input en 100 para evitar que los otros sliders se muevan visualmente,
// y restringe dinámicamente el valor actual para no superar el 100% total.
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

// 5. LÓGICA PARA AGREGAR NUEVO PRESUPUESTO
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

// 6. LÓGICA DE DOBLE CONFIRMACIÓN DE ELIMINACIÓN (PUNTO 1)
const pasodeEliminacion = ref(0) // 0: cerrado, 1: confirmación 1, 2: confirmación final
const presupuestoAEliminar = ref(null)

const iniciarEliminacion = (p) => {
  presupuestoAEliminar.value = p
  pasodeEliminacion.value = 1
}

const avanzarSegundaConfirmacion = () => {
  pasodeEliminacion.value = 2
}

const confirmarEliminacionDefinitiva = () => {
  if (presupuestoAEliminar.value) {
    presupuestos.value = presupuestos.value.filter(p => p.id !== presupuestoAEliminar.value.id)
  }
  cancelarEliminacion()
}

const cancelarEliminacion = () => {
  presupuestoAEliminar.value = null
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
                placeholder="0.00" 
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
                  <span class="fs-6 text-white-50">(${{ montoTotalAsignado.toFixed(2) }})</span>
                </h5>
              </div>

              <div class="border-start border-secondary border-opacity-50 ps-3">
                <p class="text-white-50 small mb-1">Disponible sin Asignar</p>
                <h5 class="fw-bold mb-0" :class="porcentajeDisponible === 0 ? 'text-warning' : 'text-success'">
                  {{ porcentajeDisponible }}%
                  <span class="fs-6 opacity-75">(${{ montoDisponible.toFixed(2) }})</span>
                </h5>
              </div>
            </div>
          </div>
        </div>

        <!-- SECCIÓN DE PRESUPUESTOS -->
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h3 class="fw-bold mb-0">Presupuestos</h3>
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
            <div class="p-3 rounded-4 border border-secondary border-opacity-25 text-center position-relative" style="background-color: #1a1a1a;">
              
              <!-- BOTÓN ELIMINAR (DESENCADENA DOBLE CONFIRMACIÓN) -->
              <button 
                @click="iniciarEliminacion(p)" 
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

                <!-- EQUIVALENCIA EN DINERO DE ESTE PORCENTAJE -->
                <p class="fs-5 fw-bold mb-3" style="color: #FF5722;">
                  ${{ calcularMonto(p.porcentaje).toFixed(2) }}
                </p>

                <label class="form-label text-white-50 small">Ajustar Porcentaje</label>
                
                <!-- RANGE SLIDER CON MIN 0 MAX 100 FIJOS Y CONTROL REACTIVO @INPUT -->
                <input 
                  v-model.number="p.porcentaje" 
                  @input="validarPorcentaje(p)"
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

        <!-- SECCIÓN DE METAS PERSONALES -->
        <div class="mb-4">
          <h3 class="fw-bold">Metas personales</h3>
        </div>
        
        <button type="button" class="btn text-white w-100 fw-bold rounded-3 mb-4" style="background-color: #FF5722;">
          + Agregar Meta Personal
        </button>

        <div class="row g-3 mb-4">
          <div class="col-md-3">
            <div class="p-3 rounded-4 border border-secondary border-opacity-25 text-center" style="background-color: #1a1a1a;">
              <div class="text-center p-3">
                <p class="text-white-50 mb-2 small">Porcentaje alcanzado:</p>
                <div class="position-relative d-inline-flex align-items-center justify-content-center mb-3">
                  <svg width="110" height="110" viewBox="0 0 36 36">
                    <path stroke="#2c2c2c" stroke-width="3.5" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path stroke="#FF5722" stroke-width="3.5" stroke-dasharray="40, 100" stroke-linecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <span class="position-absolute fs-4 fw-bold text-white">40%</span>
                </div>
                <p class="text-white mb-0 fw-bold">Presupuesto Carro Nuevo</p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  </div>

  <!-- MODAL PARA AGREGAR NUEVO PRESUPUESTO -->
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
              ${{ calcularMonto(nuevoPorcentaje).toFixed(2) }}
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
          <p class="fs-5 mb-3">¿Estás seguro de que deseas eliminar este presupuesto?</p>
          <div class="p-3 mb-4 rounded-3 border border-secondary text-start" style="background-color: #1a1a1a;">
            <p class="mb-1 text-white-50 small">Nombre del Presupuesto:</p>
            <p class="fw-bold mb-2 fs-5">{{ presupuestoAEliminar?.nombre }}</p>
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <span class="text-white-50 small">Porcentaje asignado: </span>
                <span class="fw-bold text-warning">{{ presupuestoAEliminar?.porcentaje }}%</span>
              </div>
              <div>
                <span class="text-white-50 small">Monto mensual: </span>
                <span class="fw-bold text-danger">${{ calcularMonto(presupuestoAEliminar?.porcentaje).toFixed(2) }}</span>
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
            Esta acción eliminará de forma permanente el presupuesto 
            <strong>"{{ presupuestoAEliminar?.nombre }}"</strong> y liberará el {{ presupuestoAEliminar?.porcentaje }}% de tu salario. ¿Deseas proceder?
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
</style>