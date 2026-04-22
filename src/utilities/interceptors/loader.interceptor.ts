import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { StorageService } from '../services/storage.service';
import { finalize } from 'rxjs';
import { Router } from '@angular/router';

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  const storage_service = inject(StorageService);
  const router = inject(Router);

  storage_service.incrementLoader();
  storage_service.info$.next('');
  return next(req).pipe(
    finalize(() => {
      storage_service.decrementLoader();
    })
  );
};
