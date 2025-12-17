import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { GlobalClickDirective } from '../../utilities/directives/global-click.directive';
import { StorageService } from '../../utilities/services/storage.service';
import { Subject, takeUntil } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { SearchPipe } from '../../utilities/pipes/search.pipe';

type MenuTab = 'requests' | 'faqs' | 'terms' | 'contact';
@Component({
  selector: 'app-header',
  imports: [
    RouterModule,
    MatMenuModule,
    GlobalClickDirective,
    FormsModule,
    SearchPipe
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  standalone: true,
})
export class HeaderComponent {
  private destroy$ = new Subject<void>();
  activeSupportMenu: boolean = false;

  constructor(private router: Router, private storage_service: StorageService) {
    this.router.events.subscribe(() => {
      this.activeSupportMenu = Object.values(this.menuRoutes).includes(this.router.url);
    });
  }

  menuRoutes: Record<MenuTab, string> = {
    requests: '/dashboard/service-requests',
    faqs: '/dashboard/faqs',
    terms: '/dashboard/terms',
    contact: '/dashboard/contact',
  };
  activeMenuTab: Record<MenuTab, boolean> = {
    requests: false,
    faqs: false,
    terms: false,
    contact: false,
  };

  setActive() {
    this.activeSupportMenu = true;
  }

  setActiveMenuTab(tab: string) {
  this.activeMenuTab = {
    requests: false,
    faqs: false,
    terms: false,
    contact: false,
  };
  (this.activeMenuTab as any)[tab] = true;
  this.router.events.subscribe(() => {
    (this.activeMenuTab as any)[tab] = Object.values(this.menuRoutes).includes(this.router.url)

  });
}

  searchSite!: string;
  sitesList!: Array<any>;
  ngOnInit() {
    this.storage_service.siteData$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        if (res.length === 0) return;
        this.sitesList = res.sites;
        this.currentSite = this.sitesList[0];
        const current = this.storage_service.currentSite$.getValue();
        if (!current) {
          this.storage_service.currentSite$.next(this.currentSite);
        }
      },
    });
    this.router.events.subscribe(() => {
      const current = this.router.url;

      // Reset
      for (const key in this.activeMenuTab) {
        this.activeMenuTab[key as MenuTab] = false;
      }

      // Activate
      for (const key in this.menuRoutes) {
        if (this.menuRoutes[key as MenuTab] === current) {
          this.activeMenuTab[key as MenuTab] = true;
        }
      }
    });
  }

  currentSite: any;
  showSite: boolean = false;
  set(site: any) {
    this.showSite = !this.showSite;
    this.currentSite = site;
    this.storage_service.currentSite$.next(this.currentSite);
  }

  @ViewChild('siteInput') siteInput!: ElementRef;
  toggleSites(): void {
    this.searchSite = '';
    this.showSite = !this.showSite;
    setTimeout(() => {
      this.siteInput.nativeElement?.focus()
    }, 500)
  }

  logout() {
    this.router.navigate(['/login']);
    this.storage_service.clearData();
  }
}
