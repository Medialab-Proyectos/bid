import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { catchError, mergeMap, switchMap } from 'rxjs/operators';
import { MsalService } from '@azure/msal-angular';
import { AuthError } from '@azure/msal-browser';
import { SharingService } from '@core/services/app/scopes/sharing.service';
@Injectable()
export class MsalInterceptor implements HttpInterceptor {
  constructor(
    private readonly authService: MsalService,
    private sharingService: SharingService
  ) {}
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return this.handleRedirect(request, next);
  }

  handleRedirect(request: HttpRequest<any>, next: HttpHandler) {
    return from(this.authService.instance.handleRedirectPromise()).pipe(
      switchMap(() => {
        return this.logic(request, next);
      })
    );
  }

  logic(request: HttpRequest<any>, next: HttpHandler) {
    if (this.authService.instance.getAllAccounts().length > 0) {
      const tokenRequest = {
        scopes: this.sharingService.getScopes(request.url),
        account: this.authService.instance.getActiveAccount(),
      };
      return this.authService.acquireTokenSilent(tokenRequest).pipe(
        mergeMap((r) => {
          request = request.clone({
            setHeaders: {
              Authorization: `Bearer ${r.accessToken}`,
            },
          });
          return next.handle(request);
        }),
        catchError((error) => {
          if (error instanceof AuthError) {
            return this.authService.loginRedirect(tokenRequest).pipe(
              mergeMap(() => {
                request = request.clone({
                  setHeaders: {},
                });
                return next.handle(request);
              }),
              catchError(() => {
                return next.handle(request);
              })
            );
          }
          return throwError(() => error)
        })
      );
    } else {
      return next.handle(request);
    }
  }
}
