import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { User } from './login/login.component';
import { StorageService } from '../../utilities/services/storage.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
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
      callingSystemDetail: '',
    };
    return this.http.post(url, user);
  }

  getUserInfoForId() {
    var user = this.storage_service.getData('user');
    let url = `${environment.authUrl}/getUserInfoForUserId_1_0/${user?.UserId}`;
    return this.http.get(url);
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
    };
    return this.http.post(url, obj);
  }

  updateForgotPassword(payload: any): Observable<any> {
    const url = `${environment.authUrl}/UpdateForgotPassword_1_0`;
    const obj = {
      email: payload.email,
      newPassword: payload?.newPassword,
    };
    return this.http.put(url, obj);
  }

  getAccessforRefreshToken(payload: any): Observable<any> {
    let url = `${environment.authUrl}/getAccessforRefreshToken`;
    let params = new HttpParams()
      .set('refresh_token', payload?.RefreshToken)
      .set('modifiedBy', payload?.UserId);
    return this.http.post(url, null, { params: params });
  }

  updateProfilePicture(payload: any) {
    let url = `${environment.authUrl}/updateProfilePicture_1_0`;
    var a = this.storage_service.getData('user');
    var userId = a?.UserId;
    var userName = a?.UserName;
    let body = new FormData();
    body.append('file', payload?.file);
    body.append('user_id', payload?.userId);
    return this.http.post(url, body);
  }

  listRoles() {
    let url = `${environment.authUrl}/listRoles_1_0`;
    var user = this.storage_service.getData('user');
    let params = new HttpParams()
      .set('createdBy', user?.UserId)
      .set('department', user?.roleList[0].department);
    return this.http.get(url, { params: params });
  }

  updateUser(payload: any) {
    var user = this.storage_service.getData('user');
    let url = `${environment.authUrl}/updateUser_1_0/${user?.UserId}`;
    return this.http.put(url, payload);
  }

  getUserNamesByUserName(): Observable<any> {
    var user = this.storage_service.getData('user');
    let url = environment.authUrl + '/getUserNamesByUserIds_1_0';
    let params = new HttpParams().set('user_id', user?.UserId);
    return this.http.get(url, { params });
  }

  // getUserNamesBySubuser(usr: any): Observable<any> {
  //   let url = environment.authUrl + '/getUserNamesByUserIds_1_0';
  //   let params = new HttpParams().set('user_id', usr?.UserId);
  //   return this.http.get(url, { params: params });
  // }

  deactivateUser(payload: any) {
    let url = `${environment.authUrl}/deactivateUser_1_0/${payload?.userId}`;
    return this.http.post(url, null);
  }

  createUserWithShortDetails(payload: any) {
    let url = `${environment.authUrl}/createUserWithShortDetails_1_0`;
    var user = this.storage_service.getData('user');

    payload.realm = 'IVISUSA';
    payload.employeeFlag = 'F';
    payload.empId = '';
    payload.safetyEscortFlag = 'F';
    payload.firstTimeFlag = 'T';
    payload.callingSystemDetail = 'portal';
    payload.accountId = user.accountId ?? 0;
    payload.createdBy = user.UserId;
    payload.roleList = [parseInt(payload.roleList)];
    return this.http.post(url, payload);
  }

  updatePassword(payload: any) {
    let url = environment.authUrl + `/updatePassword_1_0`;
    let user = this.storage_service.getData('user');
    let obj = {
      userName: user?.UserName,
      oldPassword: payload.oldPassword,
      newPassword: payload.newPassword,
      firstTime: 'F',
    };
    console.log(user);
    return this.http.put(url, obj);
  }

  getSitesListForGlobalAccountId(payload: any): Observable<any> {
    // let url = 'http://192.168.0.231:8922/userDetails/getSitesListForGlobalAccountId_1_0/'
    let url = environment.authUrl + '/getSitesListForGlobalAccountId_1_0/';
    // var user = this.storageService.getEncrData('user');
    let params = new HttpParams();
    if (payload?.userId) {
      params = params.set('userId', payload?.userId);
    }
    if (payload?.loginId) {
      params = params.set('loginId', payload?.loginId);
    }
    if (payload?.assigned !== null) {
      params = params.set('assigned', payload?.assigned);
    }
    params = params.set('callingSystemDetail', 'portal');
    return this.http.get(url, { params: params });
  }

  applySitesMapping(payload: any) {
    var user = this.storage_service.getData('user');
    let url = `${environment.authUrl}/applySitesMapping_1_0`;
    return this.http.post(url, payload);
  }

  unassignSiteForUser(payload: any) {
    // let url = this.url1 + '/userDetails/unassignSiteForUser_1_0';
    let url = `${environment.authUrl}/unassignSiteForUser_1_0`;
    return this.http.post(url, payload);
  }

  logout() {
    this.storage_service.clearData();
    this.router.navigate(['./login']);
  }
}
