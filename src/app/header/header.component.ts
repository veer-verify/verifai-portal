import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, OnInit, Output, ViewChild } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { GlobalClickDirective } from '../../utilities/directives/global-click.directive';
import { StorageService } from '../../utilities/services/storage.service';
import { Observable, Subject, takeUntil } from 'rxjs';
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
    NgClass
],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  standalone: true,
})
export class HeaderComponent implements OnInit {

  constructor(
    private router: Router,
    public storage_service: StorageService,
    private elementRef: ElementRef,
    private config_service: ConfigService
  ) { }
  isDropdownOpen = false;
  showSideBar = false;
  closeSideBar = false;

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  openSideBar(){
    if(this.showSideBar){
      this.closeSideBar = true;
      setTimeout(()=>{
        this.closeSideBar = false;
        this.showSideBar = !this.showSideBar
      },300)
      return;
    }
    this.showSideBar = !this.showSideBar;
  }
  
  @HostListener('document:click', ['$event']) onClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showSite = false
      this.showSideBar = false;
    }
  }
  
  searchSite!: string;
  sitesList!: Observable<any>;
  user: any;
  navItems: any;
  serviceData: any;
  isAdmin: boolean = false;
  ngOnInit(): void {
    this.isAdmin = this.storage_service.isAdmin();
    this.user = this.storage_service.getData('user');
    this.sitesList = this.storage_service.siteData$;
    this.storage_service.currentSite$.subscribe((res: any)=>{
      this.config_service.listSiteServices(res).subscribe((res: any)=>{
        // console.log(res);
        if(res.statusCode === 200){
          this.serviceData = res.siteServicesList;
          this.navItems = menuItems
        }
      })
    })
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
