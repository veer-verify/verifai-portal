import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { User } from './login/login.component';
import { StorageService } from '../../utilities/services/storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http: HttpClient,
    private storage_service: StorageService
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
  
}
