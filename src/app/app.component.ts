import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { delay, Observable } from 'rxjs';
import { StorageService } from '../utilities/services/storage.service';
import { AsyncPipe } from '@angular/common';
import { LoaderComponent } from '../utilities/components/loader/loader.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AsyncPipe, LoaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'verifai-portal';
  private storage_service = inject(StorageService);
  public showLoader!: Observable<boolean>;

  /**
   * implemented global loader usnig interceptor
   */
  constructor() {
    this.showLoader = this.storage_service.loader$.pipe(delay(0));
  };

  ngOnInit(): void {
  };

  ngAfterViewInit(): void {
  };

}
