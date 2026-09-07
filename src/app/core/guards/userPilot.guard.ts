import { inject } from '@angular/core';
import { CanActivateFn, NavigationEnd, Router } from '@angular/router';
import { filter, take } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Userpilot } from 'userpilot';

export const userPilotGuard: CanActivateFn = () => {
  const router = inject(Router);
  router.events
    .pipe(
      filter((event) => event instanceof NavigationEnd),
      take(1)
    )
    .subscribe(() => {
      const token = localStorage.getItem('token');
      if (environment.userPilot.enabled && token) {
        Userpilot.reload();
      }
    });
  return true;
};
