<template>
  <div
    class="col-md-3 col-lg-2 p-4 text-white d-flex flex-column position-sticky top-0 vh-100"
    style="background-color: #0a0a0a;"
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

    <!-- BOTÓN DE CERRAR SESIÓN -->
    <div class="pt-3 border-top border-secondary border-opacity-25">
      <router-link
        to="/"
        class="nav-link text-danger rounded-3 fw-bold"
      >
        <i class="bi bi-box-arrow-right me-2"></i>
        Cerrar Sesión
      </router-link>
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
</style>