import { HttpInterceptorFn, HttpEvent, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take, Observable } from 'rxjs';
import { StorageService } from '../services/storage.service';
import { AuthService } from '../../app/auth/auth.service';


let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const TokenInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next
): Observable<any> => {

  const storageService = inject(StorageService);
  const authSer = inject(AuthService);

  const session = storageService.getData('user');

  if (session?.AccessToken) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${session.AccessToken}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {

      if (error.status === 401) {
        return handle401Error(req, next, authSer, storageService);
      }

      return throwError(() => error);
    })
  );
};


function handle401Error(
  req: HttpRequest<any>,
  next: any,
  authSer: AuthService,
  storageService: StorageService
): Observable<any> {

  const session = storageService.getData('user');

  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authSer.getAccessforRefreshToken(session).pipe(
      switchMap((res: any) => {
        isRefreshing = false;

        session.AccessToken = res.access_token;
        storageService.saveData('user', session);

        refreshTokenSubject.next(res.access_token);

        return next(
          req.clone({
            setHeaders: { Authorization: `Bearer ${res.access_token}` }
          })
        );
      }),
      catchError(err => {
        isRefreshing = false;
        authSer.logout();
        return throwError(() => err);
      })
    );

  } else {

    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token =>
        next(
          req.clone({
            setHeaders: { Authorization: `Bearer ${token}` }
          })
        )
      )
    );
  }
}
