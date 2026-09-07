import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
} from '@angular/common/http';
import { finalize, Observable, of, share, tap } from 'rxjs';
import {
  CacheEntry,
  CacheInterceptorService,
} from '@fiduciary-interface/app/shared/services/cache-interceptor.service';
import { SHOULD_CACHE_REQUEST } from '@core/utils/httpContexts';

@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  constructor(private cacheService: CacheInterceptorService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Verificar si la petición debe ser cacheada
    const shouldCache = req.context.get(SHOULD_CACHE_REQUEST);

    // Si no debe ser cacheada o no es GET, continuar sin cache
    if (!shouldCache || req.method !== 'GET') {
      return next.handle(req);
    }

    const cacheKey = this.generateCacheKey(req);

    if (this.cacheService.getInFlightRequests().has(cacheKey)) {
      return this.cacheService.getInFlightRequests().get(cacheKey)!;
    }

    const cachedEntry = this.cacheService.getCache().get(cacheKey);
    if (cachedEntry && this.isValidCache(cachedEntry)) {
      return of(cachedEntry.response);
    }

    if (cachedEntry && !this.isValidCache(cachedEntry)) {
      this.cacheService.getCache().delete(cacheKey);
    }

    const request$ = next.handle(req).pipe(
      tap((event) => {
        if (
          event instanceof HttpResponse &&
          event.status >= 200 &&
          event.status < 300
        ) {
          this.addToCache(cacheKey, event);
        }
      }),
      finalize(() => {
        this.cacheService.getInFlightRequests().delete(cacheKey);
      }),
      share()
    );

    this.cacheService.getInFlightRequests().set(cacheKey, request$);
    return request$;
  }

  private generateCacheKey(req: HttpRequest<any>): string {
    const url = req.urlWithParams;
    const headers = this.getRelevantHeaders(req);
    const body = req.body ? JSON.stringify(req.body) : '';
    return `${req.method}-${url}-${headers}-${body}`;
  }

  private getRelevantHeaders(req: HttpRequest<any>): string {
    const relevantHeaders = ['accept-language', 'content-type'];
    const headers: string[] = [];

    relevantHeaders.forEach((header) => {
      const value = req.headers.get(header);
      if (value) {
        headers.push(`${header}:${value}`);
      }
    });

    return headers.join('|');
  }

  private isValidCache(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < this.cacheService.getCacheTTL();
  }

  private addToCache(key: string, response: HttpResponse<any>): void {
    if (
      this.cacheService.getCache().size >= this.cacheService.getMaxCacheSize()
    ) {
      const firstKey = this.cacheService.getCache().keys().next().value;
      if (firstKey) {
        this.cacheService.getCache().delete(firstKey);
      }
    }

    this.cacheService.getCache().set(key, {
      response: response.clone(),
      timestamp: Date.now(),
    });
  }
}
