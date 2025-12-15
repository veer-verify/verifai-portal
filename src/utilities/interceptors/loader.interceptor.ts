import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { StorageService } from '../services/storage.service';
import { finalize } from 'rxjs';

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  const storage_service = inject(StorageService);

  storage_service.loader$.next(true);
  return next(req).pipe(
    finalize(() => {
      storage_service.loader$.next(false);
    })
  );
};
