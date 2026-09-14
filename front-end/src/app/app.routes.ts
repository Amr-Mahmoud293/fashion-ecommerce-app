import { Routes } from '@angular/router';
import { Login } from './layout/login/login';
import { Signup } from './layout/signup/signup';
import { Home } from './layout/home/home';
import { Productslist } from './layout/productslist/productslist';
import { Productdetails } from './layout/productslist/productdetails/productdetails';
import { Cart } from './layout/cart/cart';
import { Order } from './layout/order/order';
import { Faq } from './layout/faq/faq';
import { authGuard } from './core/guards/auth-guard';
import { Profile } from './layout/profile/profile';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'products', component: Productslist },
  { path: 'products/:categorySlug/:productSlug', component: Productdetails },
  { path: 'cart', component: Cart },
  { path: 'order', component: Order, canActivate: [authGuard] },
  { path: 'checkout', component: Order, canActivate: [authGuard] },
  { path: 'faq', component: Faq },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
  { path: 'login', component: Login },
  { path: 'signup', component: Signup },
  { path: '**', redirectTo: 'home' },
];