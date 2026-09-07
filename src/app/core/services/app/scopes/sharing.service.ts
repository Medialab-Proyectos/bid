import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';

@Injectable()
export class SharingService {
  public getScopes(url: string): string[] {
    switch (true) {
      case url.includes(environment.hostApi.fiduciaryProcessApi.endpoint): {
        return environment.ScopesB2C.FiduciaryProcess;
      }
      default: {
        return environment.adB2C.scopes;
      }
    }
  }
}
