import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GlobalSpinnerService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$: Observable<boolean> = this.loadingSubject.asObservable();

  private activeRequests = 0;

  showLoading(): void {
    this.activeRequests++;
    this.loadingSubject.next(true);
  }

  hideLoading(): void {
    this.activeRequests--;
    if (this.activeRequests < 0) {
      this.activeRequests = 0;
    }

    if (this.activeRequests === 0) {
      this.loadingSubject.next(false);
    }
  }

  resetLoading(): void {
    this.activeRequests = 0;
    this.loadingSubject.next(false);
  }

  getActiveRequestsCount(): number {
    return this.activeRequests;
  }
}
