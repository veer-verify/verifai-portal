import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
// import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LiveViewComponent } from './nav/live-view/live-view.component';
import { ServiceRequestsComponent } from './nav/service-requests/service-requests.component';
import { AlertsComponent } from './nav/alerts/alerts.component';
import { authGuard } from './auth/auth.guard';
import { TimelapseComponent } from './nav/timelapse/timelapse.component';
import { ProfileComponent } from './nav/profile/profile.component';
import { ChangePasswordComponent } from './nav/profile/change-password/change-password.component';
import { TermsConditionsComponent } from './nav/service-requests/terms-conditions/terms-conditions.component';
import { ContactComponent } from './nav/service-requests/contact/contact.component';
import { NvrComponent } from './nav/nvr/nvr.component';
import { HealthComponent } from './nav/health/health.component';
import { TrendsComponent } from './nav/trends/trends.component';
// import { CalendarComponent } from './nav/calendar/calendar.component';

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
        component: LiveViewComponent,
      },
      {
        path: 'alerts',
        component: AlertsComponent,
      },
      {
        path: 'service-requests',
        component: ServiceRequestsComponent,
      },
      {
        path: 'terms-conditions',
        component: TermsConditionsComponent,
      },
      {
        path: 'contact',
        component: ContactComponent,
      },
      {
        path: 'timelapse',
        component: TimelapseComponent,
      },
      {
        path: 'nvr',
        component: NvrComponent,
      },
      {
        path: 'profile',
        component: ProfileComponent,
      },
      {
        path: 'change-password',
        component: ChangePasswordComponent,
      },
      {
        path: 'health',
        component: HealthComponent,
      },
      {
        path: 'trends',
        component: TrendsComponent,
      },
      {
        path: '',
        redirectTo: '/dashboard/live-view',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
];
