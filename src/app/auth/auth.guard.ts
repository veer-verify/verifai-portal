import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { StorageService } from '../../utilities/services/storage.service';

export const authGuard: CanActivateFn = (route, state) => {
  const user = inject(StorageService).getData('user');
  if(user) return true;
  return false;
};
