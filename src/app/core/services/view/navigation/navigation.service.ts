import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  constructor(private readonly route: Router) {}
  public navigateTo(path: string, param?: any) {
    if (param) {
      const newRoute = path
        .replace(':code', param.code)
        .replace(':contract', param.contract.replace('/', '%2F'));
      this.route.navigate([newRoute]);
    } else {
      this.route.navigate([path]);
    }
  }
}
