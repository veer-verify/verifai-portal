import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { StorageService } from '../services/storage.service';
import { catchError, finalize, map, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  const storage_service = inject(StorageService);
  const router = inject(Router);

  storage_service.loader$.next(true);
  storage_service.info$.next('');
  return next(req).pipe(
    // catchError((err: HttpErrorResponse) => {
    //   console.log(err)
    //   router.navigateByUrl('/');
    //   return throwError(() => new Error('Something went wrong on the server!'));
    // }),
    // map((res: any) => {
    //   if (res.statusCode === 404) {
    //   }
    //   return res;
    // }),
    finalize(() => {
      storage_service.loader$.next(false);
    })
  );
};
