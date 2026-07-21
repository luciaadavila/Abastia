import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { ListaCompra } from './components/lista-compra/lista-compra';
import { Login } from './components/login/login';
import { Productos } from './components/productos/productos';
import { Profile } from './components/profile/profile';
import { Register } from './components/register/register';
import { Sidenav } from './components/sidenav/sidenav';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'register',
    component: Register,
  },

  {
    path: '',
    component: Sidenav,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      {
        path: 'home',
        component: Home,
        canActivate: [authGuard],
      },

      {
        path: 'productos',
        component: Productos,
        canActivate: [authGuard],
      },
      {
        path: 'listaCompra',
        component: ListaCompra,
        canActivate: [authGuard],
      },
      {
        path: 'profile',
        component: Profile,
        canActivate: [authGuard],
      },
    ],
  },

  {
    path: '**',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
