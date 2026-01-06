import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, OnInit, Output, ViewChild } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { GlobalClickDirective } from '../../utilities/directives/global-click.directive';
import { StorageService } from '../../utilities/services/storage.service';
import { Observable, Subject, takeUntil } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { SearchPipe } from '../../utilities/pipes/search.pipe';
import { AsyncPipe, TitleCasePipe, UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [
    RouterModule,
    MatMenuModule,
    FormsModule,
    SearchPipe,
    TitleCasePipe,
    AsyncPipe,
    UpperCasePipe
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  standalone: true,
})
export class HeaderComponent implements OnInit {

  constructor(
    private router: Router,
    public storage_service: StorageService,
    private elementRef: ElementRef
  ) { }
  isDropdownOpen = false;

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }


  @HostListener('document:click', ['$event']) onClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showSite = false
    }
  }

  searchSite!: string;
  sitesList!: Observable<any>;
  user: any;
  ngOnInit(): void {
    this.user = this.storage_service.getData('user');
    this.sitesList = this.storage_service.siteData$;
  }

  showSite: boolean = false;
  updateSite(site: any) {
    this.showSite = !this.showSite;
    this.storage_service.currentSite$.next(site);
  }

  @ViewChild('siteInput', { static: false }) siteInput!: ElementRef;
  toggleSites(): void {
    this.searchSite = '';
    this.showSite = !this.showSite;
    setTimeout(() => {
      if (this.showSite) {
        this.siteInput.nativeElement?.focus()
      }
    }, 500);
  }

  logout() {
    this.router.navigate(['/login']);
    this.storage_service.clearData();
  }

}
