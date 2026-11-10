<script setup>
import Sidebar from '../components/Sidebar.vue'
</script>

<template>
  <div class="container-fluid p-0">
    <div class="row g-0 min-vh-100">

      <!-- MENÚ LATERAL REUTILIZABLE -->
      <Sidebar />

      <!-- CONTENIDO PRINCIPAL -->
      <div class="col-md-9 col-lg-10 p-4 p-md-5 text-white" style="background-color: #121212;">

        <h2 class="fw-bold mb-2">
          comparte tu ahorro.
        </h2>

        <p class="text-white-50 mb-4">
          Administra tus objetivos de ahorro compartido.
        </p>

        <!-- AHORRO COMPARTIDO -->
        <div class="row g-3 mb-4 p-3 rounded-4 border border-secondary border-opacity-25" style="background-color: #1a1a1a;">

          <!-- NOMBRE DEL AHORRO -->
          <div class="col-md-4">
            <p class="text-white-50">
              Ahorro Compartido
              <i class="bi bi-people-fill"></i>
            </p>

            <h2>
              <i class="bi bi-airplane-engines" style="color: #FF5722;"></i>
              Viaje a Japón
            </h2>
          </div>

          <!-- PROGRESO -->
          <div class="col-md-6">
            <p class="text-white">
              $1.560.000 Ahorrados
            </p>

            <div class="progress mt-3 me-3" role="progressbar" aria-valuenow="18.57" aria-valuemin="0" aria-valuemax="100">
              <div class="progress-bar bg-success" style="width: 18.57%;">
                18,57%
              </div>
            </div>

            <p class="text-white-50 mt-2">
              Objetivo: $8.400.000
            </p>
          </div>

          <!-- BOTÓN -->
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