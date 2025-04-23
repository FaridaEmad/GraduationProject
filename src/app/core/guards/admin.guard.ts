import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

export const adminGuard: CanActivateFn = (route, state) => {
  const _Router = inject(Router);
  const token = localStorage.getItem('userToken');

  if (token) {
    const decoded: any = jwtDecode(token);
    if (decoded.role === 'Admin') {
      return true;
    } else {
      _Router.navigate(['/user/home']);
      return false;
    }
  }

  _Router.navigate(['/login']);
  return false;
};
