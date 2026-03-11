import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { authGuard, canDeactivateDashboard } from './auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'live-view',
        loadComponent: () => import('./nav/live-view/live-view.component').then((c) => c.LiveViewComponent)
      },
      {
        path: 'alerts',
        loadComponent: () => import('./nav/alerts/alerts.component').then((c) => c.AlertsComponent)
      },
      {
        path: 'timelapse',
        loadComponent: () => import('./nav/timelapse/timelapse.component').then((c) => c.TimelapseComponent)
      },
      {
        path: 'nvr',
        loadComponent: () => import('./nav/nvr/nvr.component').then((c) => c.NvrComponent)
      },
      {
        path: 'health',
        loadComponent: () => import('./nav/health/health.component').then((c) => c.HealthComponent)
      },
      {
        path: 'trends',
        loadComponent: () => import('./nav/trends/trends.component').then((c) => c.TrendsComponent)
      },
      {
        path: 'insights',
        loadComponent: () => import('./nav/insights/insights.component').then((c) => c.InsightsComponent)
      },
      {
        path: 'service-requests',
        loadComponent: () => import('./nav/service-requests/service-requests.component').then((c) => c.ServiceRequestsComponent)
      },
      {
        path: 'site-map',
        loadComponent: () => import('./nav/insights/site-map/site-map.component').then((c) => c.SiteMapComponent)
      },
      {
        path: 'siteinfo',
        loadComponent: () => import('./nav/siteinfo/siteinfo.component').then((c) => c.SiteinfoComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./nav/profile/profile.component').then((c) => c.ProfileComponent)
      },
      {
        path: 'terms-conditions',
        loadComponent: () => import('./nav/service-requests/terms-conditions/terms-conditions.component').then((c) => c.TermsConditionsComponent)
      },
      {
        path: 'contact',
        loadComponent: () => import('./nav/service-requests/contact/contact.component').then((c) => c.ContactComponent)
      },
      {
        path: 'change-password',
        loadComponent: () => import('./nav/profile/change-password/change-password.component').then((c) => c.ChangePasswordComponent)
      },

      {
        path: '',
        redirectTo: '/dashboard/live-view',
        pathMatch: 'full',
      }
    ],
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
];
