import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/auth-guard';
import { AdminLayout } from './layout/admin-layout/admin-layout';
import { ProductPage } from './pages/products/product-page/product-page';
import { CategoryPage } from './pages/categories/category-page/category-page';
import { SubcategoryPage } from './pages/subcategories/subcategory-page/subcategory-page';
import { OrderPage } from './pages/orders/order-page/order-page';
import { ShippingPage } from './pages/shipping/shipping-page/shipping-page';
import { ReportPage } from './pages/reports/report-page/report-page';
import { NotificationPage } from './pages/notfications/notification-page/notification-page';
import { FaqPage } from './pages/faqs/faq-page/faq-page';
import { UserPage } from './pages/users/user-page/user-page';
import { ProfilePage } from './pages/profile/profile-page/profile-page';
import { ReviewPage } from './pages/reviews/review-page/review-page';
import { Login } from './layout/login/login';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'products', pathMatch: 'full' },
      { path: 'products', component: ProductPage },
      { path: 'categories', component: CategoryPage },
      { path: 'subcategories', component: SubcategoryPage },
      { path: 'orders', component: OrderPage },
      { path: 'shipping', component: ShippingPage },
      { path: 'reports', component: ReportPage },
      { path: 'notifications', component: NotificationPage },
      { path: 'reviews', component: ReviewPage },
      { path: 'faqs', component: FaqPage },
      { path: 'users', component: UserPage },
      { path: 'profile', component: ProfilePage },
    ],
  },
  {
    path: 'products',
    redirectTo: 'admin/products',
  },
  {
    path: 'categories',
    redirectTo: 'admin/categories',
  },
  {
    path: 'subcategories',
    redirectTo: 'admin/subcategories',
  },
  {
    path: 'orders',
    redirectTo: 'admin/orders',
  },
  {
    path: 'shipping',
    redirectTo: 'admin/shipping',
  },
  {
    path: 'reports',
    redirectTo: 'admin/reports',
  },
  {
    path: 'notifications',
    redirectTo: 'admin/notifications',
  },
  {
    path: 'reviews',
    redirectTo: 'admin/reviews',
  },
  {
    path: 'faqs',
    redirectTo: 'admin/faqs',
  },
  {
    path: 'users',
    redirectTo: 'admin/users',
  },
  {
    path: 'profile',
    redirectTo: 'admin/profile',
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];



