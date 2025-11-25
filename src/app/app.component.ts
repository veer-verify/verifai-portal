import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Observable } from 'rxjs';
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

  storage_service = inject(StorageService);
  showLoader!: Observable<boolean>;

  constructor() {
    this.showLoader = this.storage_service.loader$;
  }
  
  ngOnInit(): void {
  }
  
  ngAfterViewInit(): void {
    
  }
}
