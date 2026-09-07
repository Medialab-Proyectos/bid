import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '@fiduciary-interface/environments/environment';
import { isDemoError, resolveDemoRequest } from './demo-backend.routes';

/** Fake network latency, so loaders and skeletons are visible in the demo. */
const DEMO_LATENCY_MS = 220;

/**
 * Answers every call to the fiduciary API with local data while the app runs
 * in demo mode. Nothing leaves the browser: no database, no backend, no Azure.
 *
 * Requests to anything else (i18n files, assets) are passed through untouched.
 */
@Injectable()
export class DemoBackendInterceptor implements HttpInterceptor {
  private readonly apiBase = environment.hostApi.fiduciaryProcessApi.endpoint;
  private readonly unmatched = new Set<string>();

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    if (!environment.demoMode || !request.url.startsWith(this.apiBase)) {
      return next.handle(request);
    }

    const withoutBase = request.url.slice(this.apiBase.length);
    const [rawPath, rawQuery] = withoutBase.split('?');
    const query = new URLSearchParams(rawQuery ?? '');
    request.params.keys().forEach((key) => {
      query.set(key, request.params.get(key));
    });

    const decoded = this.decodeBody(request.body);
    const resolution = resolveDemoRequest(
      decoded === request.body ? request : request.clone({ body: decoded }),
      rawPath,
      query
    );

    if (!resolution.matched) {
      this.warnOnce(request.method, rawPath);
    }

    if (isDemoError(resolution.body)) {
      const failure = resolution.body.__demoError;
      return throwError(
        () =>
          new HttpErrorResponse({
            status: failure.status,
            url: request.url,
            error: failure.body,
          })
      ).pipe(delay(DEMO_LATENCY_MS));
    }

    return of(
      new HttpResponse({
        status: 200,
        url: request.url,
        body: resolution.body,
      })
    ).pipe(delay(DEMO_LATENCY_MS));
  }

  /**
   * `EncodeInterceptor` base64-encodes every POST and PUT body unless the
   * caller opts out, so the real API receives `{ encode: '<base64>' }` and
   * decodes it. The demo backend has to do the same, otherwise handlers see an
   * opaque string instead of the payload.
   */
  private decodeBody(body: unknown): unknown {
    const encoded = (body as { encode?: unknown })?.encode;
    if (typeof encoded !== 'string') {
      return body;
    }

    try {
      return JSON.parse(decodeURIComponent(escape(atob(encoded))));
    } catch {
      return body;
    }
  }

  /**
   * Logs each unmapped endpoint once. It is the shopping list for extending
   * `demo-backend.routes.ts` when a new screen needs demo data.
   */
  private warnOnce(method: string, path: string): void {
    const key = `${method} ${path}`;
    if (this.unmatched.has(key)) {
      return;
    }
    this.unmatched.add(key);
    console.warn(`[demo] no mock defined for ${key} - returned empty payload`);
  }
}
