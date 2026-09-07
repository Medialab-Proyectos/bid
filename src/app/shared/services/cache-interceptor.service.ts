import { HttpEvent, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface CacheEntry {
  response: HttpResponse<any>;
  timestamp: number;
}

@Injectable({
  providedIn: 'root',
})
@Injectable({ providedIn: 'root' })
export class CacheInterceptorService {
  private cache = new Map<string, CacheEntry>();
  private inFlightRequests = new Map<string, Observable<HttpEvent<any>>>();

  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos
  private readonly MAX_CACHE_SIZE = 100;

  public clearCache(): void {
    this.cache.clear();
    this.inFlightRequests.clear();
  }

  public clearCacheByPattern(pattern: string): void {
    const keysToDelete: string[] = [];
    this.cache.forEach((_, key) => {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  public getCacheStats(): { size: number; inFlight: number } {
    return {
      size: this.cache.size,
      inFlight: this.inFlightRequests.size,
    };
  }

  public getCache() {
    return this.cache;
  }
  public getInFlightRequests() {
    return this.inFlightRequests;
  }
  public getCacheTTL() {
    return this.CACHE_TTL;
  }
  public getMaxCacheSize() {
    return this.MAX_CACHE_SIZE;
  }
}
