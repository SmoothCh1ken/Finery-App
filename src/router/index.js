import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import PrincipalView from '../views/PrincipalView.vue'
import RegistroView from '../views/RegistroView.vue'
import MovimientosView from '../views/MovimientosView.vue'
import PresupuestosView from '../views/PresupuestosView.vue'
import AhorroView from '../views/AhorroView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView
    },
    {
      path: '/resumen',
      name: 'principal',
      component: PrincipalView
    },
    {
      path: '/registro',
      name: 'registro',
      component: RegistroView
    },
    {
      path: '/movimientos',
      name: 'movimientos',
      component: MovimientosView
    },
    {
      path: '/presupuestos',
      name: 'presupuestos',
      component: PresupuestosView
    },
    {
      path: '/ahorro',
      name: 'ahorro',
      component: AhorroView
    }
  ]
})

export default router