// import { isPlatformBrowser } from '@angular/common';
// import { inject, PLATFORM_ID } from '@angular/core';
// import { CanActivateFn, Router } from '@angular/router';

// export const logedGuard: CanActivateFn = (route, state) => {
//   const _Router = inject(Router)
//   const _PLATFORM_ID = inject(PLATFORM_ID)

//   if(isPlatformBrowser(_PLATFORM_ID)){
//     if(localStorage.getItem('userToken') !== null){
//       _Router.navigate(['/user/home'])
//       return false
//     } else {
//       return true
//     }
//   } else{
//     return false
//   }

// };
import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const logedGuard: CanActivateFn = (route, state) => {
  const _Router = inject(Router);
  const _PLATFORM_ID = inject(PLATFORM_ID);

  if (isPlatformBrowser(_PLATFORM_ID)) {
    // إذا كان المستخدم قد سجل الدخول (يوجد userToken)
    if (localStorage.getItem('userToken') == null) {
      // توجيه المستخدم إلى صفحة home مباشرة
      _Router.navigate(['/user/home']);
      return false;
    } else {
      return true;  // يسمح بالوصول إلى صفحة Login و Register إذا لم يكن هناك userToken
    }
  } else {
    return false;
  }
};

