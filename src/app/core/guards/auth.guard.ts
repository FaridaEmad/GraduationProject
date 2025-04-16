// import { isPlatformBrowser } from '@angular/common';
// import { inject, PLATFORM_ID } from '@angular/core';
// import { CanActivateFn, Router } from '@angular/router';

// export const authGuard: CanActivateFn = (route, state) => {
//   const _Router = inject(Router)
//   const _PLATFORM_ID = inject(PLATFORM_ID)

//   if(isPlatformBrowser(_PLATFORM_ID)){
//     if(localStorage.getItem('userToken') !== null){
//       return true
//     } else{
//       _Router.navigate(['/login'])
//       return false
//     }
//   } else{
//     return false
//   }

// };
import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const _Router = inject(Router);
  const _PLATFORM_ID = inject(PLATFORM_ID);

  if (isPlatformBrowser(_PLATFORM_ID)) {
    // إذا كان المستخدم قد سجل الدخول (يوجد userToken)
    if (localStorage.getItem('userToken') == null) {
      // يسمح بالدخول إلى الصفحة المحمية
      return true;
    } else {
      // إذا لم يكن المستخدم قد سجل الدخول، يتم توجيهه إلى صفحة login
      _Router.navigate(['/login']);
      return false;
    }
  } else {
    return false;
  }
};
