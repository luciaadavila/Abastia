import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Login } from './components/login/login';
import { Products } from './components/products/products';
import { Profile } from './components/profile/profile';
import { Register } from './components/register/register';
import { ShoppingList } from './components/shopping-list/shopping-list';
import { authGuard } from './core/guards/auth-guard';
import { Sidenav } from './shared/components/sidenav/sidenav';

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
        path: 'products',
        component: Products,
        canActivate: [authGuard],
      },
      {
        path: 'shoppingList',
        component: ShoppingList,
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
