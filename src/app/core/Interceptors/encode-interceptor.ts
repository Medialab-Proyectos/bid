import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpMethods } from '@core/enums';
import { REQUEST_IS_ENCODED } from '@core/utils/httpContexts';
@Injectable({
  providedIn: 'root',
})
export class EncodeInterceptor implements HttpInterceptor {
  constructor() {}
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (req.method === HttpMethods.POST || req.method === HttpMethods.PUT) {
      if (req.context.get(REQUEST_IS_ENCODED) === true) {
        const bodyEncode = btoa(
          unescape(encodeURIComponent(JSON.stringify(req.body)))
        );
        req = req.clone({
          body: {
            encode: bodyEncode,
          },
        });
      }
    }
    return next.handle(req);
  }
}
