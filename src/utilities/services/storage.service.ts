import { Injectable } from '@angular/core';
import { AES } from 'crypto-js';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private readonly key = "verifai";

  private _loader = new BehaviorSubject(false);
  public loader$ = this._loader.asObservable();

  private _siteData = new BehaviorSubject([]);
  public siteData$ = this._siteData.asObservable();
  public currentSite$ = new BehaviorSubject(null);

  public show(): void {
    this._loader.next(true);
  }

  public hide(): void {
    this._loader.next(false);
  }

  public saveSites(data: any): void {
    this._siteData.next(data);
  }

  public encrypt(txt: string): string {
    return AES.encrypt(txt, this.key).toString();
  }

  public decrypt(txtToDecrypt: string) {
    return AES.decrypt(txtToDecrypt, this.key).toString(CryptoJS.enc.Utf8);
  }

  getType(type: any) {
    let data: any[] = this.getData('metaData');
    return data.filter((item: any) => item.type == type);
  }

  public saveData(name: any, data: any) {
    // let x = btoa(encodeURIComponent(JSON.stringify(data)));
    // localStorage.setItem(name, x);
    localStorage.setItem(name, JSON.stringify(data));
  }

  public getData(data: any) {
    // let x: any = localStorage.getItem(data);
    // return JSON.parse(decodeURIComponent(atob(x)));
    return JSON.parse(localStorage.getItem(data)!);
  }

  public removeData(key: string) {
    localStorage.removeItem(key);
  }

  public clearData() {
    localStorage.clear();
  }

}
