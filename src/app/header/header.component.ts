import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { GlobalClickDirective } from '../../utilities/directives/global-click.directive';
import { StorageService } from '../../utilities/services/storage.service';
import { delay, filter, Observable, of, Subject, takeUntil } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { SearchPipe } from '../../utilities/pipes/search.pipe';
import { AsyncPipe, TitleCasePipe, UpperCasePipe, NgClass } from '@angular/common';
import { ConfigService } from '../../utilities/services/config.service';
import { menuItems } from './menu-items';

@Component({
  selector: 'app-header',
  imports: [
    RouterModule,
    MatMenuModule,
    FormsModule,
    SearchPipe,
    TitleCasePipe,
    AsyncPipe,
    UpperCasePipe,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  standalone: true,
})
export class HeaderComponent implements OnInit, OnDestroy {

  @HostListener('document:click', ['$event']) onClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showSite = false
      this.showSideBar = false;
    }
  }

  constructor(
    private router: Router,
    public storage_service: StorageService,
    private elementRef: ElementRef,
    private config_service: ConfigService
  ) { }

  destroy$ = new Subject<void>();
  isDropdownOpen = false;
  showSideBar = false;
  searchSite!: string;
  // sitesList!: Observable<any>;
  user: any;
  navItems: any;
  serviceData: any;
  isAdmin: boolean = false;
  showSite: boolean = false;

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  openSideBar() {
    this.showSideBar = !this.showSideBar;
  }


  ngOnInit(): void {
    this.isAdmin = this.storage_service.isAdmin();
    this.user = this.storage_service.getData('user');
    // this.sitesList = this.storage_service.siteData$;
    this.storage_service.currentSite$
      .pipe(
        filter((site) => !!site),
        takeUntil(this.destroy$)
      )
      .subscribe((res: any) => {
        this.config_service.listSiteServices(res).subscribe((res: any) => {
          if (res.statusCode === 200) {
            this.serviceData = res.siteServicesList;
            this.navItems = menuItems
          }
        })
      })
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // updateSite(site: any) {
  //   this.showSite = !this.showSite;
  //   this.storage_service.currentSite$.next(site);
  // }

  // @ViewChild('siteInput') set siteInput(element: ElementRef) {
  //   if (element && this.showSite) {
  //     element.nativeElement.focus();
  //   }
  // }

  // toggleSites(): void {
  //   this.searchSite = '';
  //   this.showSite = !this.showSite;
  // }

  logout() {
    this.router.navigate(['/login']);
    this.storage_service.clearData();
  }

}
