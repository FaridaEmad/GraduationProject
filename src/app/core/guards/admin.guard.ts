import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

export const adminGuard: CanActivateFn = (route, state) => {
  const _Router = inject(Router);

  // ✅ تأكيد إننا في المتصفح قبل استخدام localStorage
  if (typeof window !== 'undefined' && localStorage.getItem('userToken')) {
    const token = localStorage.getItem('userToken');
    
    const decoded: any = jwtDecode(token!);
    
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
