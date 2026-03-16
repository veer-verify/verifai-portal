import { inject } from '@angular/core';
import { CanActivateFn, CanDeactivateFn } from '@angular/router';
import { StorageService } from '../../utilities/services/storage.service';
import { DashboardComponent } from '../dashboard/dashboard.component';

export const authGuard: CanActivateFn = (route, state) => {
  const user = inject(StorageService).getData('user');
  if (user) return true;
  return false;
};

export const canDeactivateDashboard: CanDeactivateFn<DashboardComponent> = (component) => {
  return component.check() ? false : true;
}
