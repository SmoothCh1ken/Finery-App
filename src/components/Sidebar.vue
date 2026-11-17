<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// Correo del usuario logueado
const usuarioCorreo = ref('diazbascur@gmail.com')

// Estado del recuadro de notificaciones
const mostrarNotificaciones = ref(false)
const contenedorNotificaciones = ref(null)

// Lista de notificaciones no leídas
const notificaciones = ref([
  {
    id: 1,
    tipo: 'invitacion',
    titulo: 'Invitación a Ahorro Compartido',
    remitente: 'carlos.mendez@correo.com',
    nombreAhorro: 'Vacaciones en Cartagena',
    metaTotal: 4500000,
    icono: 'bi-airplane-engines',
    colorIcono: '#FF5722',
    tiempo: 'Hace 5 min'
  },
  {
    id: 2,
    tipo: 'alerta',
    titulo: 'Alerta de Presupuesto',
    mensaje: 'Ya has utilizado el 80% de tu presupuesto mensual asignado a Alimentación ($500.000).',
    icono: 'bi-exclamation-circle-fill',
    colorIcono: '#ffc107',
    tiempo: 'Hace 2 horas'
  },
  {
    id: 3,
    tipo: 'aporte',
    titulo: 'Nuevo Aporte en Grupo',
    mensaje: 'Laura Gómez aportó $250.000 al objetivo compartido "Viaje a Japón".',
    icono: 'bi-piggy-bank-fill',
    colorIcono: '#198754',
    tiempo: 'Ayer'
  }
])

const formatearDinero = (valor) => {
  return Math.round(Number(valor || 0)).toLocaleString('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })
}

const toggleNotificaciones = () => {
  mostrarNotificaciones.value = !mostrarNotificaciones.value
}

const aceptarInvitacion = (id) => {
  notificaciones.value = notificaciones.value.filter(n => n.id !== id)
}

const rechazarInvitacion = (id) => {
  notificaciones.value = notificaciones.value.filter(n => n.id !== id)
}

const marcarComoLeida = (id) => {
  notificaciones.value = notificaciones.value.filter(n => n.id !== id)
}

// Cerrar el recuadro al hacer clic fuera
const manejarClicExterno = (event) => {
  if (
    mostrarNotificaciones.value &&
    contenedorNotificaciones.value &&
    !event.composedPath().includes(contenedorNotificaciones.value)
  ) {
    mostrarNotificaciones.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', manejarClicExterno)
})

onUnmounted(() => {
  document.removeEventListener('click', manejarClicExterno)
})
</script>

<template>
  <div
    class="col-md-3 col-lg-2 p-4 text-white d-flex flex-column position-sticky top-0 vh-100"
    style="background-color: #0a0a0a; z-index: 1040;"
  >
    <!-- LOGO FINERY -->
    <h3 class="fw-bold mb-4">
      Finery<span style="color: #FF5722;">.</span>
    </h3>

    <!-- MENÚ DE NAVEGACIÓN -->
    <ul class="nav flex-column gap-2 mb-auto">
      <li class="nav-item">
        <router-link
          to="/resumen"
          class="nav-link text-white-50 rounded-3"
          active-class="active-link"
        >
          <i class="bi bi-columns-gap me-2"></i>
          Resumen
        </router-link>
      </li>

      <li class="nav-item">
        <router-link
          to="/movimientos"
          class="nav-link text-white-50 rounded-3"
          active-class="active-link"
        >
          <i class="bi bi-arrow-left-right me-2"></i>
          Movimientos
        </router-link>
      </li>

      <li class="nav-item">
        <router-link
          to="/presupuestos"
          class="nav-link text-white-50 rounded-3"
          active-class="active-link"
        >
          <i class="bi bi-wallet2 me-2"></i>
          Presupuestos
        </router-link>
      </li>

      <li class="nav-item">
        <router-link
          to="/ahorro"
          class="nav-link text-white-50 rounded-3"
          active-class="active-link"
        >
          <i class="bi bi-people me-2"></i>
          Ahorro Compartido
        </router-link>
      </li>
    </ul>

    <!-- CORREO DEL USUARIO LOGUEADO (ENCIMA DEL SEPARADOR) -->
    <div class="mb-3 px-2 d-flex align-items-center text-white-50">
      <i class="bi bi-person-circle fs-5 me-2 flex-shrink-0"></i>
      <span class="small text-truncate" :title="usuarioCorreo">
        {{ usuarioCorreo }}
      </span>
    </div>

    <!-- BOTÓN DE CERRAR SESIÓN Y NOTIFICACIONES -->
    <div
      ref="contenedorNotificaciones"
      class="pt-3 border-top border-secondary border-opacity-25 d-flex align-items-center justify-content-between gap-2 position-relative"
    >
      <router-link
        to="/"
        class="nav-link text-danger rounded-3 fw-bold px-2 py-2 flex-grow-1 text-truncate"
      >
        <i class="bi bi-box-arrow-right me-2"></i>
        Cerrar Sesión
      </router-link>

      <!-- BOTÓN DE NOTIFICACIONES (SOLO ICONO SIN RECUADRO) -->
      <button
        @click.stop="toggleNotificaciones"
        type="button"
        class="btn p-0 border-0 bg-transparent position-relative text-white-50 btn-notificaciones flex-shrink-0 me-2"
        :class="{ 'activo': mostrarNotificaciones }"
        title="Notificaciones no leídas"
      >
        <i class="bi bi-bell-fill fs-5"></i>
        <span
          v-if="notificaciones.length > 0"
          class="position-absolute top-0 start-100 translate-middle badge rounded-pill text-white"
          style="background-color: #FF5722; font-size: 0.65rem; padding: 0.25em 0.45em;"
        >
          {{ notificaciones.length }}
        </span>
      </button>

      <!-- RECUADRO DESPLEGABLE DE NOTIFICACIONES (A LA DERECHA DEL BOTÓN) -->
      <div
        v-if="mostrarNotificaciones"
        @click.stop
        class="popover-notificaciones rounded-4 border border-secondary border-opacity-50 shadow-lg p-3 text-white"
        style="background-color: #1a1a1a;"
      >
        <div class="d-flex justify-content-between align-items-center pb-2 mb-3 border-bottom border-secondary border-opacity-25">
          <div class="d-flex align-items-center gap-2">
            <span class="fw-bold small">Notificaciones no leídas</span>
            <span
              v-if="notificaciones.length > 0"
              class="badge rounded-pill text-white"
              style="background-color: #FF5722; font-size: 0.7rem;"
            >
              {{ notificaciones.length }}
            </span>
          </div>
          <button
            @click="mostrarNotificaciones = false"
            type="button"
            class="btn-close btn-close-white"
            style="font-size: 0.65rem;"
            aria-label="Cerrar"
          ></button>
        </div>

        <!-- LISTA SCROLLEABLE DE NOTIFICACIONES -->
        <div v-if="notificaciones.length > 0" class="d-flex flex-column gap-2 lista-notificaciones">
          <div
            v-for="notif in notificaciones"
            :key="notif.id"
            class="p-3 rounded-3 border border-secondary border-opacity-25 flex-shrink-0"
            style="background-color: #121212;"
          >
            <!-- TIPO 1: INVITACIÓN A AHORRO COMPARTIDO -->
            <template v-if="notif.tipo === 'invitacion'">
              <div class="d-flex justify-content-between align-items-start mb-1">
                <span class="badge bg-dark border border-secondary text-white-50" style="font-size: 0.68rem;">
                  <i class="bi bi-people-fill me-1" style="color: #FF5722;"></i>
                  {{ notif.titulo }}
                </span>
                <small class="text-white-50" style="font-size: 0.7rem;">{{ notif.tiempo }}</small>
              </div>

              <p class="small mb-2 text-white-50">
                <strong class="text-white">{{ notif.remitente }}</strong> te invitó a unirte al ahorro compartido:
              </p>

              <div class="p-2 rounded-3 mb-2 border border-secondary border-opacity-25 d-flex align-items-center justify-content-between" style="background-color: #1a1a1a;">
                <div class="d-flex align-items-center gap-2 text-truncate">
                  <i :class="['bi', notif.icono, 'fs-5']" :style="{ color: notif.colorIcono }"></i>
                  <span class="fw-bold small text-truncate">{{ notif.nombreAhorro }}</span>
                </div>
                <span class="small text-white-50 ms-2 flex-shrink-0">
                  Meta: <strong class="text-white">${{ formatearDinero(notif.metaTotal) }}</strong>
                </span>
              </div>

              <div class="d-flex gap-2 mt-2">
                <button
                  @click="rechazarInvitacion(notif.id)"
                  type="button"
                  class="btn btn-sm btn-outline-secondary w-50 rounded-3 fw-bold"
                >
                  Rechazar
                </button>
                <button
                  @click="aceptarInvitacion(notif.id)"
                  type="button"
                  class="btn btn-sm text-white w-50 rounded-3 fw-bold"
                  style="background-color: #FF5722;"
                >
                  Aceptar
                </button>
              </div>
            </template>

            <!-- TIPO 2: NOTIFICACIÓN GENERAL / ALERTA / APORTE -->
            <template v-else>
              <div class="d-flex justify-content-between align-items-start mb-1">
                <span class="fw-bold small d-flex align-items-center gap-1">
                  <i :class="['bi', notif.icono]" :style="{ color: notif.colorIcono }"></i>
                  {{ notif.titulo }}
                </span>
                <small class="text-white-50" style="font-size: 0.7rem;">{{ notif.tiempo }}</small>
              </div>

              <p class="small text-white-50 mb-2">
                {{ notif.mensaje }}
              </p>

              <div class="text-end">
                <button
                  @click="marcarComoLeida(notif.id)"
                  type="button"
                  class="btn btn-sm btn-outline-light py-0 px-2 rounded-3"
                  style="font-size: 0.75rem;"
                >
                  <i class="bi bi-check2 me-1"></i> Marcar como leída
                </button>
              </div>
            </template>
          </div>
        </div>

        <!-- ESTADO SIN NOTIFICACIONES -->
        <div v-else class="text-center py-4 text-white-50">
          <i class="bi bi-bell-slash fs-3 d-block mb-2"></i>
          <p class="small mb-0">No tienes notificaciones no leídas.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Aplica el fondo naranja, el texto en blanco puro y la negrita al elemento seleccionado */
.active-link {
  background-color: #FF5722 !important;
  color: #ffffff !important;
  font-weight: bold !important;
}

/* Botón de notificaciones: solo icono reactivo */
.btn-notificaciones {
  line-height: 1;
  box-shadow: none !important;
  transition: color 0.2s ease, transform 0.2s ease;
}

.btn-notificaciones:hover,
.btn-notificaciones.activo {
  color: #ffffff !important;
  transform: scale(1.15);
}

/* Panel desplegable a la derecha del botón en escritorio */
.popover-notificaciones {
  position: absolute;
  bottom: 0;
  left: calc(100% + 28px);
  width: 340px;
  max-width: calc(100vw - 2rem);
  z-index: 1060;
}

/* Ajuste responsivo para pantallas móviles donde el sidebar ocupa todo el ancho */
@media (max-width: 767.98px) {
  .popover-notificaciones {
    bottom: calc(100% + 12px);
    left: auto;
    right: 0;
  }
}

/* Altura fija equivalente a 2 notificaciones con scroll vertical */
.lista-notificaciones {
  max-height: 290px;
  overflow-y: auto;
  padding-right: 4px;
  scrollbar-width: thin;
  scrollbar-color: #444444 #1a1a1a;
}

.lista-notificaciones::-webkit-scrollbar {
  width: 6px;
}

.lista-notificaciones::-webkit-scrollbar-track {
  background: #1a1a1a;
  border-radius: 4px;
}

.lista-notificaciones::-webkit-scrollbar-thumb {
  background: #444444;
  border-radius: 4px;
}

.lista-notificaciones::-webkit-scrollbar-thumb:hover {
  background: #FF5722;
}
</style>