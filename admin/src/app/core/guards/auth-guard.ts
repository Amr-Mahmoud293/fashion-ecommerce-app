import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthServices } from '../services/auth-services';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthServices);
  const router = inject(Router);

  if (authService.isLogin() && authService.isAdmin()) {
    return true;
  }

  // Clear any invalid non-admin credentials and redirect to login
  if (authService.isLogin() && !authService.isAdmin()) {
    authService.logout();
    return false;
  }

  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

export const authGuard: CanActivateFn = adminGuard;

