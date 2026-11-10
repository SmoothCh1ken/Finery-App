<script setup>
// Lógica de registro para conectar con el backend más adelante
</script>

<template>
  <div class="container-fluid p-0">
    <div class="row g-0 vh-100">
      <!-- COLUMNA IZQUIERDA: IMAGEN DE FONDO Y LOGO -->
      <div 
        class="col-md-7 text-white p-5 d-md-block" 
        style="background-image: url('/img/loginBG.jpg'); background-size: cover; background-position: center 25%;"
      >
        <div class="w-75 mx-auto">
          <h1 class="mt-5 fw-bold display-3">
            Finery<span style="color: #FF5722;">.</span>
          </h1>
          <h3 class="mt-3 fw-bold">
            Toma el control de tus finanzas<br>hoy.
          </h3>
          <br><br><br><br><br><br>
        </div>
      </div>

      <!-- COLUMNA DERECHA: FORMULARIO DE REGISTRO -->
      <div class="col-md-5 d-flex align-items-center justify-content-center text-white" style="background-color: #000000">
        <div class="w-75">
          <h3 class="mb-4">Registrarse</h3>

          <form @submit.prevent>
            <div class="mb-3">
              <input type="text" class="form-control" placeholder="Nombre completo" required>
            </div>

            <div class="mb-3">
              <div class="input-group">
                <span class="input-group-text bg-white" id="basic-addon1">@</span>
                <input type="email" class="form-control" placeholder="Correo electrónico" required>
              </div>
            </div>

            <div class="mb-4">
              <input type="password" class="form-control" placeholder="********" required>
            </div>

            <div class="d-grid gap-2 mb-4">
              <router-link to="/resumen" class="btn rounded-pill text-white" style="background-color: #FF5722;">
                Sign Up
              </router-link>
            </div>

            <div class="text-center mb-4">
              <router-link to="/" class="text-decoration-none text-white fw-bold">
                ¿Ya tienes una cuenta?
              </router-link>
            </div>

            <hr class="mb-4">

            <div class="d-grid gap-2">
              <router-link to="/resumen" class="btn btn-outline-light rounded-pill">
                <i class="bi bi-google me-2"></i>Google Log In
              </router-link>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>