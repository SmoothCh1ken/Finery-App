<script setup>
import { ref } from 'vue'
import Sidebar from '../components/Sidebar.vue'

// ==========================================
// 1. CATÁLOGOS DE ICONOS Y COLORES
// ==========================================
const iconosDisponibles = [
  { clase: 'bi-airplane-engines', nombre: 'Viaje' },
  { clase: 'bi-house-heart', nombre: 'Hogar' },
  { clase: 'bi-car-front-fill', nombre: 'Vehículo' },
  { clase: 'bi-piggy-bank-fill', nombre: 'Ahorro' },
  { clase: 'bi-gift-fill', nombre: 'Regalo' },
  { clase: 'bi-laptop', nombre: 'Tecnología' },
  { clase: 'bi-heart-pulse-fill', nombre: 'Salud' },
  { clase: 'bi-mortarboard-fill', nombre: 'Estudios' },
  { clase: 'bi-briefcase-fill', nombre: 'Negocio' },
  { clase: 'bi-controller', nombre: 'Ocio' }
]

const coloresDisponibles = [
  { hex: '#FF5722', nombre: 'Naranja' },
  { hex: '#198754', nombre: 'Verde' },
  { hex: '#0dcaf0', nombre: 'Cian' },
  { hex: '#ffc107', nombre: 'Amarillo' },
  { hex: '#d63384', nombre: 'Rosa' },
  { hex: '#8b5cf6', nombre: 'Púrpura' },
  { hex: '#ffffff', nombre: 'Blanco' }
]

// ==========================================
// 2. ESTADO REACTIVO DE AHORROS COMPARTIDOS
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

// Funciones auxiliares de formato y cálculo
const formatearDinero = (valor) => {
  return Number(valor || 0).toLocaleString('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
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

// ==========================================
// 3. MODAL: CREAR NUEVO AHORRO COMPARTIDO
// ==========================================
const mostrarModalCrear = ref(false)
const errorCrear = ref('')
const correoInputCrear = ref('')

const formCrear = ref({
  nombre: '',
  metaTotal: null,
  valorActual: 0,
  icono: 'bi-airplane-engines',
  colorIcono: '#FF5722',
  participantes: []
})

const abrirModalCrear = () => {
  formCrear.value = {
    nombre: '',
    metaTotal: null,
    valorActual: 0,
    icono: 'bi-airplane-engines',
    colorIcono: '#FF5722',
    participantes: []
  }
  correoInputCrear.value = ''
  errorCrear.value = ''
  mostrarModalCrear.value = true
}

const agregarCorreoCrear = () => {
  const correo = correoInputCrear.value.trim().toLowerCase()
  if (!correo) return

  if (!correo.includes('@') || !correo.includes('.')) {
    errorCrear.value = 'Ingresa un correo electrónico válido.'
    return
  }

  const yaExiste = formCrear.value.participantes.some(p => p.correo === correo)
  if (yaExiste) {
    errorCrear.value = 'Este correo ya está en la lista de invitados.'
    return
  }

  formCrear.value.participantes.push({
    id: Date.now() + Math.random(),
    correo,
    estado: 'Pendiente'
  })
  correoInputCrear.value = ''
  errorCrear.value = ''
}

const quitarCorreoCrear = (id) => {
  formCrear.value.participantes = formCrear.value.participantes.filter(p => p.id !== id)
}

const crearAhorroCompartido = () => {
  if (!formCrear.value.nombre.trim()) {
    errorCrear.value = 'Ingresa un nombre para el ahorro compartido.'
    return
  }
  if (!formCrear.value.metaTotal || formCrear.value.metaTotal <= 0) {
    errorCrear.value = 'La meta total debe ser mayor a $0.'
    return
  }
  if (formCrear.value.valorActual < 0) {
    errorCrear.value = 'El valor actual no puede ser negativo.'
    return
  }

  ahorrosCompartidos.value.push({
    id: Date.now(),
    nombre: formCrear.value.nombre.trim(),
    valorActual: Number(formCrear.value.valorActual || 0),
    metaTotal: Number(formCrear.value.metaTotal),
    icono: formCrear.value.icono,
    colorIcono: formCrear.value.colorIcono,
    participantes: [...formCrear.value.participantes]
  })

  mostrarModalCrear.value = false
}

// ==========================================
// 4. MODAL: AGREGAR MONTO (+ AGREGAR MONTO)
// ==========================================
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
      Number(ahorroSeleccionadoAbono.value.valorActual) + Number(montoAbono.value)
  }

  mostrarModalAbonar.value = false
  ahorroSeleccionadoAbono.value = null
}

// ==========================================
// 5. MODAL: EDITAR / GESTIONAR AHORRO (CLIC EN TARJETA)
// ==========================================
const mostrarModalEditar = ref(false)
const errorEditar = ref('')
const correoInputEditar = ref('')

const formEditar = ref({
  id: null,
  nombre: '',
  valorActual: 0,
  metaTotal: 0,
  icono: 'bi-airplane-engines',
  colorIcono: '#FF5722',
  participantes: []
})

const abrirModalEditar = (ahorro) => {
  formEditar.value = {
    id: ahorro.id,
    nombre: ahorro.nombre,
    valorActual: ahorro.valorActual,
    metaTotal: ahorro.metaTotal,
    icono: ahorro.icono,
    colorIcono: ahorro.colorIcono,
    participantes: ahorro.participantes.map(p => ({ ...p }))
  }
  correoInputEditar.value = ''
  errorEditar.value = ''
  mostrarModalEditar.value = true
}

const invitarUsuarioEnEdicion = () => {
  const correo = correoInputEditar.value.trim().toLowerCase()
  if (!correo) return

  if (!correo.includes('@') || !correo.includes('.')) {
    errorEditar.value = 'Ingresa un correo electrónico válido.'
    return
  }

  const yaExiste = formEditar.value.participantes.some(p => p.correo === correo)
  if (yaExiste) {
    errorEditar.value = 'Este usuario ya fue invitado o ya participa en el ahorro.'
    return
  }

  formEditar.value.participantes.push({
    id: Date.now() + Math.random(),
    correo,
    estado: 'Pendiente'
  })

  // Sincronizar también en la lista principal inmediatamente
  const ahorroOriginal = ahorrosCompartidos.value.find(a => a.id === formEditar.value.id)
  if (ahorroOriginal) {
    ahorroOriginal.participantes = formEditar.value.participantes.map(p => ({ ...p }))
  }

  correoInputEditar.value = ''
  errorEditar.value = ''
}

const guardarEdicionAhorro = () => {
  if (!formEditar.value.nombre.trim()) {
    errorEditar.value = 'El nombre del ahorro no puede estar vacío.'
    return
  }
  if (!formEditar.value.metaTotal || formEditar.value.metaTotal <= 0) {
    errorEditar.value = 'La meta total debe ser mayor a $0.'
    return
  }
  if (formEditar.value.valorActual < 0) {
    errorEditar.value = 'El valor actual no puede ser negativo.'
    return
  }

  const index = ahorrosCompartidos.value.findIndex(a => a.id === formEditar.value.id)
  if (index !== -1) {
    ahorrosCompartidos.value[index] = {
      id: formEditar.value.id,
      nombre: formEditar.value.nombre.trim(),
      valorActual: Number(formEditar.value.valorActual),
      metaTotal: Number(formEditar.value.metaTotal),
      icono: formEditar.value.icono,
      colorIcono: formEditar.value.colorIcono,
      participantes: formEditar.value.participantes.map(p => ({ ...p }))
    }
  }

  mostrarModalEditar.value = false
}

// ==========================================
// 6. CONFIRMACIÓN ÚNICA: CANCELAR INVITACIÓN PENDIENTE
// ==========================================
const invitacionAEliminar = ref(null)

const solicitarEliminarInvitacion = (participante) => {
  invitacionAEliminar.value = participante
}

const confirmarEliminarInvitacion = () => {
  if (invitacionAEliminar.value) {
    formEditar.value.participantes = formEditar.value.participantes.filter(
      p => p.id !== invitacionAEliminar.value.id
    )

    // Actualizar en el estado principal
    const ahorroOriginal = ahorrosCompartidos.value.find(a => a.id === formEditar.value.id)
    if (ahorroOriginal) {
      ahorroOriginal.participantes = formEditar.value.participantes.map(p => ({ ...p }))
    }
  }
  invitacionAEliminar.value = null
}

// ==========================================
// 7. DOBLE CONFIRMACIÓN: SALIRSE DEL AHORRO COMPARTIDO
// ==========================================
const pasoSalir = ref(0) // 0: cerrado, 1: primera confirmación, 2: confirmación definitiva

const iniciarSalidaAhorro = () => {
  pasoSalir.value = 1
}

const avanzarSalidaDefinitiva = () => {
  pasoSalir.value = 2
}

const confirmarSalidaDefinitiva = () => {
  ahorrosCompartidos.value = ahorrosCompartidos.value.filter(
    a => a.id !== formEditar.value.id
  )
  pasoSalir.value = 0
  mostrarModalEditar.value = false
}

const cancelarSalida = () => {
  pasoSalir.value = 0
}
</script>

<template>
  <div class="container-fluid p-0">
    <div class="row g-0 min-vh-100">

      <!-- MENÚ LATERAL REUTILIZABLE -->
      <Sidebar />

      <!-- CONTENIDO PRINCIPAL -->
      <div class="col-md-9 col-lg-10 p-4 p-md-5 text-white" style="background-color: #121212;">

        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
          <div>
            <h2 class="fw-bold mb-1">Comparte tu ahorro.</h2>
            <p class="text-white-50 mb-0">Administra tus objetivos de ahorro compartido y colabora con otros usuarios.</p>
          </div>

          <button 
            @click="abrirModalCrear" 
            type="button" 
            class="btn text-white fw-bold rounded-3 px-4 py-2" 
            style="background-color: #FF5722;"
          >
            + Nuevo Ahorro Compartido
          </button>
        </div>

        <hr class="mb-4">

        <!-- LISTA DE TARJETAS DE AHORRO COMPARTIDO -->
        <div 
          v-for="ahorro in ahorrosCompartidos" 
          :key="ahorro.id"
          @click="abrirModalEditar(ahorro)"
          class="row g-3 mb-4 p-4 rounded-4 border border-secondary border-opacity-25 card-interactiva align-items-center position-relative" 
          style="background-color: #1a1a1a;"
          title="Haz clic para gestionar participantes, iconos o editar montos"
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

        <!-- ESTADO VACÍO -->
        <div v-if="ahorrosCompartidos.length === 0" class="p-5 rounded-4 border border-secondary border-opacity-25 text-center" style="background-color: #1a1a1a;">
          <i class="bi bi-people display-4 text-white-50 mb-3 d-block"></i>
          <h5 class="fw-bold">No tienes ahorros compartidos activos</h5>
          <p class="text-white-50 mb-4">Crea un objetivo en grupo e invita a tus amigos o familiares por correo electrónico.</p>
          <button 
            @click="abrirModalCrear" 
            type="button" 
            class="btn text-white fw-bold rounded-3 px-4" 
            style="background-color: #FF5722;"
          >
            + Crear Primer Ahorro Compartido
          </button>
        </div>

      </div>
    </div>
  </div>

  <!-- ========================================================= -->
  <!-- MODAL 1: CREAR NUEVO AHORRO COMPARTIDO                    -->
  <!-- ========================================================= -->
  <div v-if="mostrarModalCrear" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.85); z-index: 1050;">
    <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
      <div class="modal-content bg-dark text-white border border-secondary rounded-4">
        <div class="modal-header border-secondary">
          <h5 class="modal-title fw-bold">Nuevo Ahorro Compartido</h5>
          <button type="button" class="btn-close btn-close-white" @click="mostrarModalCrear = false"></button>
        </div>

        <div class="modal-body">
          <div v-if="errorCrear" class="alert alert-danger py-2 small mb-3">
            {{ errorCrear }}
          </div>

          <!-- Nombre y Montos -->
          <div class="mb-3">
            <label class="form-label text-white-50 small">Nombre del Objetivo Compartido</label>
            <input v-model="formCrear.nombre" type="text" class="form-control bg-dark text-white border-secondary" placeholder="Ej: Casa en la playa, Regalo grupal..." required>
          </div>

          <div class="row g-3 mb-4">
            <div class="col-md-6">
              <label class="form-label text-white-50 small">Meta Total ($)</label>
              <div class="input-group">
                <span class="input-group-text bg-dark text-white border-secondary">$</span>
                <input v-model.number="formCrear.metaTotal" type="number" min="1" step="any" class="form-control bg-dark text-white border-secondary" placeholder="0">
              </div>
            </div>

            <div class="col-md-6">
              <label class="form-label text-white-50 small">Monto Actual Alcanzado ($)</label>
              <div class="input-group">
                <span class="input-group-text bg-dark text-white border-secondary">$</span>
                <input v-model.number="formCrear.valorActual" type="number" min="0" step="any" class="form-control bg-dark text-white border-secondary" placeholder="0">
              </div>
            </div>
          </div>

          <!-- Selector de Icono y Color -->
          <div class="row g-3 mb-4 p-3 rounded-3 border border-secondary border-opacity-25" style="background-color: #1a1a1a;">
            <div class="col-md-7">
              <label class="form-label text-white-50 small d-block">Selecciona un Icono</label>
              <div class="d-flex flex-wrap gap-2">
                <button
                  v-for="ic in iconosDisponibles"
                  :key="ic.clase"
                  type="button"
                  @click="formCrear.icono = ic.clase"
                  class="btn btn-sm rounded-3 d-flex align-items-center justify-content-center"
                  :class="formCrear.icono === ic.clase ? 'border-2 border-white bg-secondary' : 'btn-outline-secondary'"
                  style="width: 42px; height: 42px;"
                  :title="ic.nombre"
                >
                  <i :class="['bi', ic.clase, 'fs-5']" :style="{ color: formCrear.icono === ic.clase ? formCrear.colorIcono : '#fff' }"></i>
                </button>
              </div>
            </div>

            <div class="col-md-5">
              <label class="form-label text-white-50 small d-block">Color del Icono</label>
              <div class="d-flex flex-wrap gap-2 align-items-center mt-2">
                <button
                  v-for="col in coloresDisponibles"
                  :key="col.hex"
                  type="button"
                  @click="formCrear.colorIcono = col.hex"
                  class="rounded-circle border"
                  :class="formCrear.colorIcono === col.hex ? 'border-3 border-white scale-selected' : 'border-secondary'"
                  :style="{ backgroundColor: col.hex, width: '32px', height: '32px' }"
                  :title="col.nombre"
                ></button>
              </div>
              <div class="mt-3 small text-white-50">
                Vista previa: 
                <i :class="['bi', formCrear.icono, 'fs-4 ms-2 align-middle']" :style="{ color: formCrear.colorIcono }"></i>
              </div>
            </div>
          </div>

          <!-- Invitar Participantes por Correo -->
          <div class="mb-3">
            <label class="form-label text-white-50 small">Invitar Personas por Correo Electrónico</label>
            <div class="input-group mb-2">
              <span class="input-group-text bg-dark text-white border-secondary">@</span>
              <input 
                v-model="correoInputCrear" 
                @keyup.enter.prevent="agregarCorreoCrear"
                type="email" 
                class="form-control bg-dark text-white border-secondary" 
                placeholder="amigo@correo.com"
              >
              <button @click="agregarCorreoCrear" type="button" class="btn btn-outline-light fw-bold">
                + Invitar
              </button>
            </div>

            <div v-if="formCrear.participantes.length > 0" class="d-flex flex-wrap gap-2 mt-2">
              <span 
                v-for="part in formCrear.participantes" 
                :key="part.id" 
                class="badge bg-secondary d-flex align-items-center gap-2 py-2 px-3 rounded-pill"
              >
                <i class="bi bi-envelope"></i>
                {{ part.correo }}
                <button @click="quitarCorreoCrear(part.id)" type="button" class="btn-close btn-close-white" style="font-size: 0.65rem;"></button>
              </span>
            </div>
            <small v-else class="text-white-50">Aún no has agregado correos a la invitación.</small>
          </div>
        </div>

        <div class="modal-footer border-secondary">
          <button type="button" class="btn btn-outline-secondary rounded-3" @click="mostrarModalCrear = false">Cancelar</button>
          <button type="button" class="btn text-white fw-bold rounded-3 px-4" style="background-color: #FF5722;" @click="crearAhorroCompartido">
            Crear Ahorro Compartido
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- ========================================================= -->
  <!-- MODAL 2: AGREGAR MONTO AL AHORRO                          -->
  <!-- ========================================================= -->
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
                  step="any" 
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

  <!-- ========================================================= -->
  <!-- MODAL 3: EDITAR Y GESTIONAR AHORRO (CLIC EN TARJETA)      -->
  <!-- ========================================================= -->
  <div v-if="mostrarModalEditar" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.85); z-index: 1050;">
    <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
      <div class="modal-content bg-dark text-white border border-secondary rounded-4">
        <div class="modal-header border-secondary">
          <h5 class="modal-title fw-bold">Gestionar Ahorro Compartido</h5>
          <button type="button" class="btn-close btn-close-white" @click="mostrarModalEditar = false"></button>
        </div>

        <div class="modal-body">
          <div v-if="errorEditar" class="alert alert-danger py-2 small mb-3">
            {{ errorEditar }}
          </div>

          <!-- Edición de Nombre y Montos -->
          <div class="mb-3">
            <label class="form-label text-white-50 small">Nombre del Ahorro Compartido</label>
            <input v-model="formEditar.nombre" type="text" class="form-control bg-dark text-white border-secondary fw-bold">
          </div>

          <div class="row g-3 mb-4">
            <div class="col-md-6">
              <label class="form-label text-white-50 small">Monto Actual Alcanzado ($)</label>
              <div class="input-group">
                <span class="input-group-text bg-dark text-white border-secondary">$</span>
                <input v-model.number="formEditar.valorActual" type="number" min="0" step="any" class="form-control bg-dark text-white border-secondary">
              </div>
            </div>

            <div class="col-md-6">
              <label class="form-label text-white-50 small">Meta Total ($)</label>
              <div class="input-group">
                <span class="input-group-text bg-dark text-white border-secondary">$</span>
                <input v-model.number="formEditar.metaTotal" type="number" min="1" step="any" class="form-control bg-dark text-white border-secondary">
              </div>
            </div>
          </div>

          <!-- Edición de Icono y Color -->
          <div class="row g-3 mb-4 p-3 rounded-3 border border-secondary border-opacity-25" style="background-color: #1a1a1a;">
            <div class="col-md-7">
              <label class="form-label text-white-50 small d-block">Icono de la Tarjeta</label>
              <div class="d-flex flex-wrap gap-2">
                <button
                  v-for="ic in iconosDisponibles"
                  :key="ic.clase"
                  type="button"
                  @click="formEditar.icono = ic.clase"
                  class="btn btn-sm rounded-3 d-flex align-items-center justify-content-center"
                  :class="formEditar.icono === ic.clase ? 'border-2 border-white bg-secondary' : 'btn-outline-secondary'"
                  style="width: 40px; height: 40px;"
                  :title="ic.nombre"
                >
                  <i :class="['bi', ic.clase, 'fs-5']" :style="{ color: formEditar.icono === ic.clase ? formEditar.colorIcono : '#fff' }"></i>
                </button>
              </div>
            </div>

            <div class="col-md-5">
              <label class="form-label text-white-50 small d-block">Color del Icono</label>
              <div class="d-flex flex-wrap gap-2 align-items-center mt-2">
                <button
                  v-for="col in coloresDisponibles"
                  :key="col.hex"
                  type="button"
                  @click="formEditar.colorIcono = col.hex"
                  class="rounded-circle border"
                  :class="formEditar.colorIcono === col.hex ? 'border-3 border-white scale-selected' : 'border-secondary'"
                  :style="{ backgroundColor: col.hex, width: '30px', height: '30px' }"
                  :title="col.nombre"
                ></button>
              </div>
            </div>
          </div>

          <!-- Gestión de Participantes e Invitaciones -->
          <div class="p-3 rounded-4 border border-secondary border-opacity-25 mb-3" style="background-color: #1a1a1a;">
            <h6 class="fw-bold mb-3">
              <i class="bi bi-people-fill me-2" style="color: #FF5722;"></i>
              Participantes e Invitaciones
            </h6>

            <!-- Invitar más usuarios -->
            <div class="input-group mb-3">
              <span class="input-group-text bg-dark text-white border-secondary">@</span>
              <input 
                v-model="correoInputEditar" 
                @keyup.enter.prevent="invitarUsuarioEnEdicion"
                type="email" 
                class="form-control bg-dark text-white border-secondary" 
                placeholder="Invitar nuevo usuario por correo..."
              >
              <button @click="invitarUsuarioEnEdicion" type="button" class="btn text-white fw-bold" style="background-color: #FF5722;">
                + Invitar Usuario
              </button>
            </div>

            <!-- Lista de Usuarios -->
            <ul class="list-group list-group-flush rounded-3 overflow-hidden">
              <!-- Usuario Actual -->
              <li class="list-group-item bg-dark text-white border-secondary d-flex justify-content-between align-items-center py-2 px-3">
                <div>
                  <i class="bi bi-person-check-fill me-2 text-white-50"></i>
                  <span>Tú</span>
                </div>
                <span class="badge bg-success">Compartiendo</span>
              </li>

              <!-- Demás Participantes -->
              <li 
                v-for="part in formEditar.participantes" 
                :key="part.id"
                class="list-group-item bg-dark text-white border-secondary d-flex justify-content-between align-items-center py-2 px-3"
              >
                <div class="text-truncate me-2">
                  <i class="bi bi-envelope me-2 text-white-50"></i>
                  <span>{{ part.correo }}</span>
                </div>

                <div class="d-flex align-items-center gap-2">
                  <span 
                    class="badge"
                    :class="part.estado === 'Compartiendo' ? 'bg-success' : 'bg-warning text-dark'"
                  >
                    {{ part.estado }}
                  </span>

                  <!-- X para eliminar invitación si está Pendiente -->
                  <button 
                    v-if="part.estado === 'Pendiente'" 
                    @click="solicitarEliminarInvitacion(part)"
                    type="button" 
                    class="btn btn-sm btn-outline-danger py-0 px-2 fw-bold"
                    title="Cancelar invitación pendiente"
                  >
                    <i class="bi bi-x-lg"></i>
                  </button>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- Footer del Modal Editar: Salirse vs Guardar -->
        <div class="modal-footer border-secondary d-flex justify-content-between">
          <button 
            @click="iniciarSalidaAhorro" 
            type="button" 
            class="btn btn-outline-danger fw-bold rounded-3"
          >
            <i class="bi bi-box-arrow-left me-1"></i> Salirse del ahorro compartido
          </button>

          <div class="d-flex gap-2">
            <button type="button" class="btn btn-outline-secondary rounded-3" @click="mostrarModalEditar = false">
              Cancelar
            </button>
            <button type="button" class="btn text-white fw-bold rounded-3 px-4" style="background-color: #FF5722;" @click="guardarEdicionAhorro">
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ========================================================= -->
  <!-- MODAL 4: CONFIRMACIÓN ÚNICA PARA ELIMINAR INVITACIÓN      -->
  <!-- ========================================================= -->
  <div v-if="invitacionAEliminar !== null" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.85); z-index: 1060;">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content bg-dark text-white border border-warning rounded-4">
        <div class="modal-header border-secondary">
          <h5 class="modal-title fw-bold text-warning">
            <i class="bi bi-exclamation-circle-fill me-2"></i>Cancelar Invitación
          </h5>
          <button type="button" class="btn-close btn-close-white" @click="invitacionAEliminar = null"></button>
        </div>
        <div class="modal-body text-center py-4">
          <p class="mb-2">¿Deseas eliminar la invitación pendiente enviada a:</p>
          <p class="fw-bold fs-5 text-warning mb-4">{{ invitacionAEliminar?.correo }}</p>
          <div class="d-flex justify-content-center gap-3">
            <button @click="invitacionAEliminar = null" type="button" class="btn btn-outline-light rounded-3 px-4">
              Mantener
            </button>
            <button @click="confirmarEliminarInvitacion" type="button" class="btn btn-danger fw-bold rounded-3 px-4">
              Sí, Eliminar Invitación
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ========================================================= -->
  <!-- MODAL 5: DOBLE CONFIRMACIÓN PARA SALIRSE DEL AHORRO       -->
  <!-- ========================================================= -->
  <div v-if="pasoSalir > 0" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.9); z-index: 1065;">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content bg-dark text-white border border-danger rounded-4">
        <div class="modal-header border-secondary">
          <h5 class="modal-title fw-bold text-danger d-flex align-items-center gap-2">
            <i class="bi bi-exclamation-triangle-fill"></i>
            Salir del Ahorro Compartido (Paso {{ pasoSalir }} de 2)
          </h5>
          <button type="button" class="btn-close btn-close-white" @click="cancelarSalida"></button>
        </div>

        <!-- PASO 1 DE CONFIRMACIÓN -->
        <div v-if="pasoSalir === 1" class="modal-body text-center py-4">
          <p class="fs-5 mb-3">¿Estás seguro de que deseas salirte de este ahorro compartido?</p>
          <div class="p-3 mb-4 rounded-3 border border-secondary text-start" style="background-color: #1a1a1a;">
            <p class="mb-1 text-white-50 small">Objetivo:</p>
            <p class="fw-bold fs-5 mb-1">{{ formEditar.nombre }}</p>
            <p class="mb-0 small text-white-50">
              Ahorrado actual: <strong class="text-white">${{ formatearDinero(formEditar.valorActual) }}</strong> / ${{ formatearDinero(formEditar.metaTotal) }}
            </p>
          </div>
          <div class="d-flex justify-content-center gap-3">
            <button @click="cancelarSalida" type="button" class="btn btn-outline-light rounded-3 px-4">Cancelar</button>
            <button @click="avanzarSalidaDefinitiva" type="button" class="btn btn-warning fw-bold rounded-3 px-4">
              Continuar a Confirmación Final
            </button>
          </div>
        </div>

        <!-- PASO 2 DE CONFIRMACIÓN (DEFINITIVA) -->
        <div v-if="pasoSalir === 2" class="modal-body text-center py-4">
          <i class="bi bi-door-open-fill text-danger display-3 mb-3 d-block"></i>
          <h4 class="fw-bold text-danger mb-2">¡Confirmación Definitiva!</h4>
          <p class="text-white-50 mb-4">
            Si sales de <strong>"{{ formEditar.nombre }}"</strong>, dejarás de tener acceso a este ahorro compartido y la tarjeta desaparecerá de tu panel. ¿Deseas salir definitivamente?
          </p>
          <div class="d-flex justify-content-center gap-3">
            <button @click="cancelarSalida" type="button" class="btn btn-outline-light rounded-3 px-4">No, Quedarme</button>
            <button @click="confirmarSalidaDefinitiva" type="button" class="btn btn-danger fw-bold rounded-3 px-4">
              Sí, Salirme Definitivamente
            </button>
          </div>
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

.scale-selected {
  transform: scale(1.15);
  transition: transform 0.15s ease;
}

.sello-completado {
  border: 1px solid rgba(255, 255, 255, 0.35);
  letter-spacing: 0.5px;
  box-shadow: 0 0 10px rgba(25, 135, 84, 0.45);
}
</style>