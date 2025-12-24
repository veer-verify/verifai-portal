import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { User } from './login/login.component';
import { StorageService } from '../../utilities/services/storage.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http: HttpClient,
    private storage_service: StorageService,
    private router: Router
  ) { }

  // private storage_service = inject(StorageService);
  login(payload: User): Observable<any> {
    const url = `${environment.authUrl}/user_login_1_0`;
    const user = {
      userName: payload.userName,
      password: this.storage_service.encrypt(payload.password),
      callingSystemDetail: ''
    }
    return this.http.post(url, user)
  }

  generateOTP(payload: any): Observable<any> {
    const url = `${environment.authUrl}/generateOTP_1_0`;
    const params = new HttpParams().set('email', payload?.email);
    return this.http.get(url, { params });
  }

  validateOTP(payload: any): Observable<any> {
    const url = `${environment.authUrl}/validateOTP_1_0`;
    const obj = {
      email: payload.email,
      otp: payload?.otp,
    }
    return this.http.post(url, obj);
  }

  updateForgotPassword(payload: any): Observable<any> {
    const url = `${environment.authUrl}/UpdateForgotPassword_1_0`;
    const obj = {
      email: payload.email,
      newPassword: payload?.newPassword
    }
    return this.http.put(url, obj);
  }

  getAccessforRefreshToken(payload: any): Observable<any> {
    let url = `${environment.authUrl}/getAccessforRefreshToken`;
    let params = new HttpParams().set('refresh_token', payload?.RefreshToken).set('modifiedBy', payload?.UserId);
    return this.http.post(url, null, { params: params });
  }

  logout() {
    this.storage_service.clearData();
    this.router.navigate(['./login']);
  }

}
