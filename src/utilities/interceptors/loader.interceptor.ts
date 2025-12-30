import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { StorageService } from '../services/storage.service';
import { catchError, finalize, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  const storage_service = inject(StorageService);
  const router = inject(Router);

  storage_service.loader$.next(true);
  return next(req).pipe(
    // catchError((err: HttpErrorResponse) => {
    //   console.log(err)
    //   router.navigateByUrl('/');
    //   return throwError(() => new Error('Something went wrong on the server!'));
    // }),
    finalize(() => {
      storage_service.loader$.next(false);
    })
  );
};
