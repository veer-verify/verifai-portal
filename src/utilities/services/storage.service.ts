import { Injectable, signal } from '@angular/core';
import { AES } from 'crypto-js';
import { BehaviorSubject } from 'rxjs';

export interface Site {
  siteName: string;
  siteId: number;
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private readonly key = "verifai";
  public loader$ = new BehaviorSubject(false);
  public info$ = new BehaviorSubject('');
  public siteData$ = new BehaviorSubject([]);
  public camData$ = new BehaviorSubject([]);
  public showSideNav$ = new BehaviorSubject(true);
  public currentSite$ = new BehaviorSubject<Site | null>(null);

  openSideNav() {
    this.showSideNav$.next(true);
  }

  public encrypt(txt: string): string {
    return AES.encrypt(txt, this.key).toString();
  }

  public decrypt(txtToDecrypt: string) {
    return AES.decrypt(txtToDecrypt, this.key).toString(CryptoJS.enc.Utf8);
  }

  getType(type: any) {
    let data: any[] = this.getData('metaData') || [];
    return data.filter((item: any) => item.type == type);
  }

  public isAdmin(): boolean {
    const user = this.getData('user');
    let a: Array<any> = Array.from(user.roleList, (item: any) => item.category);
    return a.includes('Admin') ? true : false;
  }

  public saveData(name: any, data: any) {
    // let x = btoa(encodeURIComponent(JSON.stringify(data)));
    // sessionStorage.setItem(name, x);
    sessionStorage.setItem(name, JSON.stringify(data));
  }

  public getData(data: any) {
    // let x: any = sessionStorage.getItem(data);
    // return JSON.parse(decodeURIComponent(atob(x)));
    return JSON.parse(sessionStorage.getItem(data)!);
  }

  public removeData(key: string) {
    sessionStorage.removeItem(key);
  }

  public clearData() {
    sessionStorage.clear();
  }

}
